// package com.kindsonthegenius.inventoryms_springboot_api.controllers;


// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import com.kindsonthegenius.inventoryms_springboot_api.models.Users;
// import com.kindsonthegenius.inventoryms_springboot_api.services.UsersService;

// import java.util.List;

// @RestController
// @RequestMapping("/api/users")
// public class UsersController {

//     private final UsersService userService;

//     @Autowired
//     public UsersController(UsersService userService) {
//         this.userService = userService;
//     }

//     @GetMapping
//     public List<Users> getAllUsers() {
//         return userService.getAllUsers();
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<Users> getUserById(@PathVariable Long id) {
//         Users user = userService.getUserById(id);
//         if (user != null) {
//             return ResponseEntity.ok(user);
//         } else {
//             return ResponseEntity.notFound().build();
//         }
//     }

//     @PostMapping
//     public ResponseEntity<Users> createUser(@RequestBody Users user) {
//         Users savedUser = userService.save(user);
//         return ResponseEntity.status(201).body(savedUser);
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<Users> updateUser(@PathVariable Long id, @RequestBody Users user) {
//         Users existingUser = userService.getUserById(id);
//         if (existingUser != null) {
//             user.setId(id); // Ensure the ID is preserved
//             return ResponseEntity.ok(userService.save(user));
//         } else {
//             return ResponseEntity.notFound().build();
//         }
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
//         Users existingUser = userService.getUserById(id);
//         if (existingUser != null) {
//             userService.deleteUser(id);
//             return ResponseEntity.noContent().build();
//         } else {
//             return ResponseEntity.notFound().build();
//         }
//     }
// }