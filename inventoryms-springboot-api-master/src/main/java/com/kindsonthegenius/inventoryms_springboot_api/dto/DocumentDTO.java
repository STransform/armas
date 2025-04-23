// package com.kindsonthegenius.inventoryms_springboot_api.dto;

// import lombok.Data;

// @Data
// public class DocumentDTO {
//     private String id;
//     private String reportype;
//     private String directoratename;

//     public DocumentDTO(Document document) {
//         this.id = document.getId();
//         this.reportype = document.getReportype();
//         this.directoratename = document.getDirectorate() != null ? document.getDirectorate().getDirectoratename() : null;
//     }
//     //generate getters and setters
//     public String getId() {
//         return id;
//     }
//     public void setId(String id) {
//         this.id = id;
//     }
//     public String getReportype() {
//         return reportype;
//     }
//     public void setReportype(String reportype) {
//         this.reportype = reportype;
//     }
//     public String getDirectoratename() {
//         return directoratename;
//     }
//     public void setDirectoratename(String directoratename) {
//         this.directoratename = directoratename;
//     }
//     //generate tostring
//     @Override
//     public String toString() {
//         return "DocumentDTO{" +
//                 "id='" + id + '\'' +
//                 ", reportype='" + reportype + '\'' +
//                 ", directoratename='" + directoratename + '\'' +
//                 '}';
//     }
// }