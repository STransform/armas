package com.simon.armas_springboot_api;

import com.simon.armas_springboot_api.security.RsaKeyProperties;
import com.simon.armas_springboot_api.security.SpringSecurityAuditorAware;
import com.simon.armas_springboot_api.security.services.RoleService;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.domain.AuditorAware;
// import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableConfigurationProperties(RsaKeyProperties.class)
@SpringBootApplication
// @EnableJpaAuditing(auditorAwareRef = "auditorAware")
@ComponentScan(basePackages = "com.simon.armas_springboot_api")
public class ArmasSpringbootApiApplication {

	@Bean
	public AuditorAware<String> auditorAware(){
		return new SpringSecurityAuditorAware();
	}

	public static void main(String[] args) {
		SpringApplication.run(ArmasSpringbootApiApplication.class, args);
	}
	
	@Bean
    CommandLineRunner init(RoleService roleService) {
        return args -> roleService.initializeRolesAndPrivileges();
    }

}
