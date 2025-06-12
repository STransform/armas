
package com.simon.armas_springboot_api.security.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.simon.armas_springboot_api.security.models.RolePrivilege;
import com.simon.armas_springboot_api.security.models.Role;
import java.util.List;
import com.simon.armas_springboot_api.security.models.Privilege;
import com.simon.armas_springboot_api.security.models.RolePrivilege;

@Repository
public interface RolePrivilegeRepository extends JpaRepository<RolePrivilege, Long> {
}