package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface MasterTransactionRepository extends JpaRepository<MasterTransaction, Integer> {
    @Query("SELECT m FROM MasterTransaction m WHERE CONCAT(m.id, ' ', m.transactiondocument.id) LIKE %:keyword%")
    List<MasterTransaction> findByTransactionDocumentIdKeyword(@Param("keyword") String keyword);

    @Query("SELECT z FROM MasterTransaction z WHERE CONCAT(z.id, ' ', z.createdBy) LIKE %?1%")
    List<MasterTransaction> findTransactionByUsername(String orgtrans);

    @Query("FROM MasterTransaction m WHERE m.user.id = :userid")
    List<MasterTransaction> findTransactionByOrg(@Param("userid") Long id);

    @Query("FROM MasterTransaction m WHERE m.user2.id = :expertid")
    List<MasterTransaction> findTransactionByExpert(@Param("expertid") Long expertId);

    @Query("SELECT m FROM MasterTransaction m WHERE m.organization.id = :orgcode")
    List<MasterTransaction> findAllTransactionByOrg(@Param("orgcode") String orgcode);

    @Query("SELECT m FROM MasterTransaction m INNER JOIN m.organization o WHERE o.orgname = ?1")
    List<MasterTransaction> getOrganizationByOrganizationName(String orgname);

    @Query("FROM MasterTransaction m WHERE m.reportcategory = :reportcategory AND m.transactiondocument.id = :docid AND m.organization.id = :theoid AND m.fiscal_year = :fiscal_year")
    List<MasterTransaction> findTransactionByDocumentId(@Param("reportcategory") String reportcategory, @Param("docid") String id, @Param("theoid") String oid, @Param("fiscal_year") String fiscal_year);

    @Query("FROM MasterTransaction m WHERE m.reportcategory = :reportcategory AND m.transactiondocument.id = :docid AND m.fiscal_year = :fiscal_year")
    List<MasterTransaction> findNoneSendersByDocumentId(@Param("docid") String id, @Param("fiscal_year") String fiscal_year, @Param("reportcategory") String reportcategory);

    @Query("SELECT new com.simon.armas_springboot_api.dto.SentReportResponseDTO(m.id, o.orgname, d.reportype, m.fiscal_year, m.createdDate, m.docname, m.reportstatus) " +
       "FROM MasterTransaction m INNER JOIN m.organization o INNER JOIN m.transactiondocument d WHERE m.reportstatus IN :statuses")
List<SentReportResponseDTO> fetchDataByStatuses(@Param("statuses") List<String> statuses);

    @Query("SELECT COUNT(DISTINCT mt.organization) FROM MasterTransaction mt WHERE mt.transactiondocument IS NOT NULL")
    int countDistinctOrganizationsWithReports();

    @Query("SELECT m FROM MasterTransaction m WHERE m.transactiondocument.id = :transactionDocumentId")
    List<MasterTransaction> findByTransactionDocumentId(@Param("transactionDocumentId") String transactionDocumentId);

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportstatus = :status")
    List<MasterTransaction> findByReportStatus(@Param("status") String status);

    @Query("SELECT m FROM MasterTransaction m WHERE m.user2.id = :userId AND m.reportstatus IN :statuses")
    List<MasterTransaction> findByUserAndStatuses(@Param("userId") Long userId, @Param("statuses") List<String> statuses);

    boolean existsByDocname(String docname);
    boolean existsByDocnameAndUserId(String docname, Long userId);
    boolean existsByDocnameAndUser(String docname, User user);
}