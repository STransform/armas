package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.exception.InvalidTokenException;
import com.simon.armas_springboot_api.exception.UserAlreadyExistException;
import com.simon.armas_springboot_api.mailing.AccountVerificationEmailContext;
import com.simon.armas_springboot_api.mailing.EmailService;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.models.Organization;
import com.simon.armas_springboot_api.models.Directorate;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.DirectorateRepository;
import com.simon.armas_springboot_api.security.models.Role;
import com.simon.armas_springboot_api.security.models.SecureToken;
import com.simon.armas_springboot_api.security.repositories.RoleRepository;
import com.simon.armas_springboot_api.security.repositories.SecureTokenRepository;
import com.simon.armas_springboot_api.security.services.RoleService;
import com.simon.armas_springboot_api.security.services.SecureTokenService;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import com.simon.armas_springboot_api.dto.PasswordChangeRequest;
import com.simon.armas_springboot_api.dto.OrganizationDTO;
import com.simon.armas_springboot_api.dto.DirectorateDTO;


import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.simon.armas_springboot_api.dto.RoleDTO;
import com.simon.armas_springboot_api.dto.UserDTO;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Value("${site.base.url.https}")
    private String baseURL;

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final DirectorateRepository directorateRepository;
    private final SecureTokenRepository secureTokenRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final SecureTokenService secureTokenService;
    private final EmailService emailService;
    private final RoleService roleService;

    @Autowired
    public UserService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       RoleRepository roleRepository,
                       DirectorateRepository directorateRepository,
                       SecureTokenRepository secureTokenRepository,
                       BCryptPasswordEncoder bCryptPasswordEncoder,
                       SecureTokenService secureTokenService,
                       RoleService roleService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.roleRepository = roleRepository;
        this.directorateRepository = directorateRepository;
        this.secureTokenRepository = secureTokenRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.secureTokenService = secureTokenService;
        this.emailService = emailService;
        this.roleService = roleService;
    }

    public User register(User user, String roleDescription) throws UserAlreadyExistException {
        if (StringUtils.isBlank(user.getUsername()) || StringUtils.isBlank(user.getPassword())) {
            throw new IllegalArgumentException("Username and password are required");
        }

        if (!Objects.equals(user.getPassword(), user.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (checkIfUserExist(user.getUsername())) {
            throw new UserAlreadyExistException("User already exists: " + user.getUsername());
        }

        if (user.getOrganization() != null && StringUtils.isNotBlank(user.getOrganization().getId())) {
            Organization org = organizationRepository.findById(user.getOrganization().getId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Organization not found with id: " + user.getOrganization().getId()));
            user.setOrganization(org);
        } else {
            user.setOrganization(null);
        }

        if (user.getDirectorate() != null && StringUtils.isNotBlank(user.getDirectorate().getId())) {
            Directorate dir = directorateRepository.findById(user.getDirectorate().getId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Directorate not found with id: " + user.getDirectorate().getId()));
            user.setDirectorate(dir);
        } else {
            user.setDirectorate(null);
        }

        Role role = roleService.findByDescription(roleDescription);
        if (role == null) {
            throw new IllegalArgumentException("Role not found: " + roleDescription);
        }
        user.getRoles().add(role);

        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        user.setConfirmPassword(null); // Clear confirmPassword
        user.setEnabled(true); // Require no email verification

        User newUser = userRepository.save(user);
        // sendRegistrationConfirmationEmail(newUser); // Disabled due to email config
        return newUser;
    }

    @Transactional
    public User registerNewUser(String username, String password, List<String> roleDescriptions) {
        if (StringUtils.isBlank(username) || StringUtils.isBlank(password)) {
            throw new IllegalArgumentException("Username and password are required");
        }

        if (checkIfUserExist(username)) {
            throw new UserAlreadyExistException("User already exists: " + username);
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(bCryptPasswordEncoder.encode(password));
        user.setEnabled(false); // Require email verification

        Set<Role> roles = roleDescriptions.stream()
                .map(desc -> {
                    Role role = roleService.findByDescription(desc);
                    if (role == null) {
                        throw new IllegalArgumentException("Role not found: " + desc);
                    }
                    return role;
                })
                .collect(Collectors.toSet());
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Transactional
    public void assignUserRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        user.getRoles().add(role);
        userRepository.save(user);
    }

    public User save(User user) {
        if (user.getId() != null) {
            User existingUser = userRepository.findById(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + user.getId()));
            existingUser.setFirstName(user.getFirstName());
            existingUser.setLastName(user.getLastName());
            existingUser.setUsername(user.getUsername());

            if (StringUtils.isNotBlank(user.getPassword())) {
                existingUser.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            }

            if (user.getOrganization() != null && StringUtils.isNotBlank(user.getOrganization().getId())) {
                Organization org = organizationRepository.findById(user.getOrganization().getId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Organization not found with id: " + user.getOrganization().getId()));
                existingUser.setOrganization(org);
            } else {
                existingUser.setOrganization(null);
            }

            if (user.getDirectorate() != null && StringUtils.isNotBlank(user.getDirectorate().getId())) {
                Directorate dir = directorateRepository.findById(user.getDirectorate().getId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Directorate not found with id: " + user.getDirectorate().getId()));
                existingUser.setDirectorate(dir);
            } else {
                existingUser.setDirectorate(null);
            }

            existingUser.setConfirmPassword(null); // Clear confirmPassword
            return userRepository.save(existingUser);
        }
        return register(user, "USER");
    }

    public UserDTO convertToDTO(User user) {
    UserDTO dto = new UserDTO();
    dto.setId(user.getId());
    dto.setUsername(user.getUsername());
    dto.setFirstName(user.getFirstName());
    dto.setLastName(user.getLastName());
    dto.setOrgname(user.getOrganization() != null ? user.getOrganization().getOrgname() : null);
    dto.setDirectoratename(user.getDirectorate() != null ? user.getDirectorate().getDirectoratename() : null);
    dto.setEnabled(user.isEnabled());
    if (user.getOrganization() != null) {
        OrganizationDTO orgDTO = new OrganizationDTO();
        orgDTO.setId(user.getOrganization().getId());
        orgDTO.setOrgname(user.getOrganization().getOrgname());
        dto.setOrganization(orgDTO);
    }
    if (user.getDirectorate() != null) {
        DirectorateDTO dirDTO = new DirectorateDTO();
        dirDTO.setId(user.getDirectorate().getId());
        dirDTO.setDirectoratename(user.getDirectorate().getDirectoratename());
        dto.setDirectorate(dirDTO);
    }
    Set<RoleDTO> roleDTOs = user.getRoles().stream()
        .map(role -> {
            RoleDTO roleDTO = new RoleDTO();
            roleDTO.setId(role.getId());
            roleDTO.setDescription(role.getDescription());
            roleDTO.setDetails(role.getDetails());
            return roleDTO;
        })
        .collect(Collectors.toSet());
    dto.setRoles(roleDTOs);
    return dto;
}

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean checkIfUserExist(String email) {
        return userRepository.findByUsername(email) != null;
    }

    public List<User> getAllUsersWithRelations() {
        return userRepository.findAllWithOrganizationsAndDirectorates();
    }

    public User getUserWithRelations(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public void sendRegistrationConfirmationEmail(User user) {
        SecureToken secureToken = secureTokenService.createSecureToken();
        secureToken.setUser(user);
        secureTokenRepository.save(secureToken);

        AccountVerificationEmailContext emailContext = new AccountVerificationEmailContext();
        emailContext.init(user);
        emailContext.setToken(secureToken.getToken());
        emailContext.buildVerificationUrl(baseURL, secureToken.getToken());
        try {
            emailService.sendMail(emailContext);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public boolean verifyUser(String token) {
        SecureToken secureToken = secureTokenService.findByToken(token);
        if (Objects.isNull(secureToken) || !StringUtils.equals(token, secureToken.getToken())
                || secureToken.isExpired()) {
            throw new InvalidTokenException("Token has expired or not valid");
        }

        User user = userRepository.getReferenceById(secureToken.getUser().getId());
        if (Objects.isNull(user)) {
            throw new InvalidTokenException("User does not exist");
        }

        user.setEnabled(true);
        userRepository.save(user);
        secureTokenService.removeToken(secureToken);
        return true;
    }

    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        // Find user by username
        User user = userRepository.findByUsername(request.getUsername());
        if (user == null) {
            throw new IllegalArgumentException("User not found with username: " + request.getUsername());
        }

        // Verify previous password
        if (!bCryptPasswordEncoder.matches(request.getPreviousPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Previous password is incorrect");
        }

        // Verify new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        // Validate new password (e.g., not "admin")
        if ("admin".equals(request.getNewPassword())) {
            throw new IllegalArgumentException("Invalid new password");
        }

        // Update password
        user.setPassword(bCryptPasswordEncoder.encode(request.getNewPassword()));
        user.setConfirmPassword(null); // Clear confirmPassword
        userRepository.save(user);
    }
     public List<UserDTO> getAllUsers() {
        return userRepository.findAllWithOrganizationsAndDirectorates().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findByIdWithRelations(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return convertToDTO(user);
    }
public void resetUserPassword(Long userId, String newPassword, String confirmPassword) {
        if (StringUtils.isBlank(newPassword) || StringUtils.isBlank(confirmPassword)) {
            throw new IllegalArgumentException("New password and confirm password are required");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        if ("admin".equals(newPassword)) {
            throw new IllegalArgumentException("Invalid new password: 'admin' is not allowed");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        user.setPassword(bCryptPasswordEncoder.encode(newPassword));
        user.setConfirmPassword(null); // Clear confirmPassword
        userRepository.save(user);
    }
}