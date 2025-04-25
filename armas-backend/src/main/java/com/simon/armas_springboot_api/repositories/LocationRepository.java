package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.Location;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends CrudRepository<Location, Integer> {

}
