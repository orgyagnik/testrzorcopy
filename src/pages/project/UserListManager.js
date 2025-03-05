// src/components/UserListManager.js

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import APIService from "../../api/APIService";
import moment from "moment";
import { pagination, display_date_format_with_time } from "../../settings";

const UserListManager = () => {
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalRecords, setUserTotalRecords] = useState(0);
  const [userSearchFilter, setUserSearchFilter] = useState('');
  const [userSort, setUserSort] = useState("desc");
  const [userSortBy, setUserSortBy] = useState("created_at");
  const [userPerPageSize, setUserPerPageSize] = useState(pagination.perPageRecordDatatable);
  const [userExportData, setUserExportData] = useState([]);
  const [userActiveFilter, setUserActiveFilter] = useState(true);
  const [userActiveList, setUserActiveList] = useState([]);
  const [userTableLoader, setUserTableLoader] = useState(false);

  useEffect(() => {
    const fetchUserList = () => {
      console.log("Fetching user list with params:", { userSort, userPerPageSize, userPage, userSortBy, userSearchFilter, userActiveFilter });
      setUserTableLoader(true);
      let params = "?is_not_staff=1&";
      params += "sort=" + userSortBy + ":" + userSort + "&limit=" + userPerPageSize + "&page=" + userPage ;
      if (userSearchFilter !== '') {
        params += "&search=" + userSearchFilter;
      }
      if (userActiveFilter) {
        params += "&active=1";
      }
  
      APIService.getStaffList(params)
        .then((response) => {
          console.log("API response:", response);
          if (response.data?.status) {
            setUserTotalPages(response.data?.pagination?.total_pages);
            setUserTotalRecords(response.data?.pagination?.total_records);
            let newData = response.data?.data;
            setUserTableLoader(false);
            let activeUserListData = newData.map(({ active, id }) => (active === 1 ? id : 0));
            setUserActiveList(activeUserListData);
            let exportHeader = ["#", "Name", "Email", "Agency", "Role", "Last Login", "Active / Deactive"];
            let exportData = [];
            newData?.forEach(item => {
              exportData.push({
                id: item.id,
                name: `${item.firstname} ${item.lastname}`,
                email: item.email ? item.email : '',
                agency: item.agency_name ? item.agency_name : '',
                role: item.role ? item.role : '',
                last_login: item.last_login ? moment(item.last_login).format(display_date_format_with_time) : '',
                active: item.active === 1 ? 'Active' : 'Deactive',
              });
            });
            setUserExportData({ fileName: "agency-user-data", sheetTitle: "Agency User", exportHeader: exportHeader, exportData: exportData });
          }
        })
        .catch((error) => {
          console.error("Error fetching user list:", error);
          toast.error("Failed to fetch user list. Please try again.");
        })
        .finally(() => {
          setUserTableLoader(false);
        });
    };
  
    fetchUserList();
  }, [userSort, userPerPageSize, userPage, userSortBy, userSearchFilter, userActiveFilter]);

  return null; // or any JSX if needed
};

export default UserListManager;