package com.kindsonthegenius.inventoryms_springboot_api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Modifying;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.kindsonthegenius.inventoryms_springboot_api.models.MasterTransaction;

// import java.util.List;

@Repository
public interface MasterTransactionRepository extends JpaRepository<MasterTransaction, Integer> {

    // @Query("SELECT p FROM MasterTransaction p WHERE CONCAT(p.id, ' ', p.transactiondocumentid) LIKE %?1%")
    // List<MasterTransaction> findByDirectorate(String keyword);

    // @Query("SELECT z FROM MasterTransaction z WHERE CONCAT(z.id, ' ', z.createdBy) LIKE %?1%")
    // List<MasterTransaction> findTransactionByUsername(String orgtrans);

    // @Query("FROM MasterTransaction m WHERE m.user.id = :userid")
    // List<MasterTransaction> findTransactionByOrg(@Param("userid") Long id);

    // @Query("FROM MasterTransaction m WHERE m.assigned_expert_user_id = :expertid")
    // List<MasterTransaction> findTransactionByExpert(@Param("expertid") Long assigned_expert_user_id);

    // @Modifying
    // @Query("UPDATE MasterTransaction m SET m.reportstatus = :reportstatus WHERE m.id = :id")
    // void updateReportStatus(@Param("id") Integer id, @Param("reportstatus") String reportstatus);

    // @Query("FROM MasterTransaction m WHERE m.theOrg_id = :orgcode")
    // List<MasterTransaction> findAllTransactionByOrg(@Param("orgcode") String theOrg_id);

    // @Query("SELECT m FROM MasterTransaction m INNER JOIN m.organization o WHERE o.orgname = ?1")
    // List<MasterTransaction> getOrganizationByOrganizationName(String orgname);

    // @Query("FROM MasterTransaction m WHERE m.reportcategory = :reportcategory AND m.transactiondocument.id = :docid AND m.organization.id = :theoid AND m.fiscal_year = :fiscal_year")
    // List<MasterTransaction> findTransactionByDocumentId(@Param("reportcategory") String reportcategory, @Param("docid") String id, @Param("theoid") String oid, String fiscal_year);

    // @Query("FROM MasterTransaction m WHERE m.reportcategory = :reportcategory AND m.transactiondocument.id = :docid AND m.fiscal_year = :fiscal_year")
    // List<MasterTransaction> findNoneSendersByDocumentId(@Param("docid") String id, @Param("fiscal_year") String fiscal_year, @Param("reportcategory") String reportcategory);

    // @Query("SELECT new mofec.gov.et.dto.SentReportResponseDTO(m.id, o.orgname, d.reportype, m.fiscal_year) " +
    //        "FROM MasterTransaction m INNER JOIN m.organization o INNER JOIN m.transactiondocument d")
    // List<SentReportResponseDTO> fetchDataInnerJoin();

    // @Query("SELECT COUNT(DISTINCT mt.organization) FROM MasterTransaction mt WHERE mt.transactiondocument IS NOT NULL")
    // int countDistinctOrganizationsWithReports();

    // @Query("SELECT m FROM MasterTransaction m WHERE m.transactiondocumentid = :transactiondocumentid")
    // List<MasterTransaction> findByTransactionDocumentId(@Param("transactiondocumentid") String transactionDocumentId);

    // boolean existsByDocname(String docname);
}