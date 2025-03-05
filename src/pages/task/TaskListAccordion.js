import React, { useState, useEffect } from 'react';
import { Accordion, Dropdown, Tooltip, OverlayTrigger, Badge, Modal, Form, Button } from 'react-bootstrap';
import moment from 'moment';
import AvatarImg from "../../assets/img/placeholder-image.png";
import DataTable from "../../modules/custom/DataTable/DataTable";
import { pagination, display_date_format, databaseRoleCode, popperConfig } from '../../settings';
import { filterDropdownOptionByName, check } from "../../utils/functions.js";
import APIService from '../../api/APIService';
//import PermissionCheck from "../../modules/Auth/PermissionCheck";
import ReactImageFallback from "react-image-fallback";
import { Link } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import { COPY_LINK_MSG } from '../../modules/lang/Task';
import { toast } from 'react-toastify';
import AdddashedIcon from "../../assets/img/icons/add-dashed.svg";
import axios from "axios";
const { REACT_APP_API_PYTHON_URL } = process.env;


export default function TaskListAccordion({ index, source, setRefreshForNewPage, refreshForNewPage, taskStatusDataList, heading, id, cstShowViewTaskModal, cstShowEditTaskModal, project, agency, assigned_id, myFollowingTasks, staffId, recurringTask, projectList, agencyList, deleteTask, updateTaskStatus, taskStatusList, userData, taskStroke, task_type, total_task, customerId }) {

    const [page, setPage] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [process, setProcess] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('id');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecord);
    const [taskList, setTaskList] = useState(taskStatusDataList);
    const [firstLoad, setFirstLoad] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [staffListForFilterOnTask, setStaffListForFilterOnTask] = useState([]);
    const [selectedAssignedByOnTask, setSelectedAssignedByOnTask] = useState([]);
    const [assignToSearch, setAssignToSearch] = useState("");
    const [staffList, setStaffList] = useState([]);
    const [staffListForFilter, setStaffListForFilter] = useState([]);
    const [staffListOnTask, setStaffListOnTask] = useState([]);
    const [taskToPublish, setTaskToPublish] = useState(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishUrl, setPublishUrl] = useState("");

    const [showOutlineModal, setShowOutlineModal] = useState(false);
    const [outlineContent, setOutlineContent] = useState("");
    const [currentTaskId, setCurrentTaskId] = useState(null);

    const formatOutlineContent = (content) => {
      // Example formatting logic (you can customize this as needed)
      return content
        .replace(/(\*\*.*?\*\*):/g, "<h3>$1</h3>") // Convert bold text followed by a colon to h3
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove asterisks from bold text
        .replace(/(\d+\.\s)/g, "<br/>$1") // Convert numbered items to plain text with line breaks
        .replace(/(\n\n)/g, "<br/><br/>") // Convert double newlines to paragraph breaks
        .replace(/(\n)/g, "<br/>"); // Convert single newlines to line breaks
    };

    const saveOutlineAsDescription = async (content, description) => {
      try {
        const loadingToast = toast.loading("Saving outline as description...");
  
        const response = await APIService.updateTask({
          taskid: currentTaskId,
          generated_outline: content,
        });
  
        if (response.data?.status) {
          toast.success("Outline saved as task description!");
          setShowOutlineModal(false);
          // Refresh the table data
          setRefreshForNewPage(!refreshForNewPage); // This triggers fetchTaskList()
        } else {
          throw new Error("Failed to save outline");
        }
      } catch (error) {
        console.error("Error saving outline:", error);
        toast.error("Failed to save outline as description. Please try again.");
      } finally {
        toast.dismiss();
      }
    };
  

      // Your outlineTask function
    const outlineTask = async (taskId, taskData) => {
      try {
        setCurrentTaskId(taskId);
        const loadingToast = toast.loading("Generating outline...");

        // Convert keyword string to array
        const keywordArray = taskData?.keywords
          ? taskData.keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : [];

        const payload = {
          client_site_url: taskData?.website_url || "",
          title: taskData?.name || "",
          keyword: keywordArray, // Now sending as array
        };

        console.log("Sending payload:", payload); // For debugging

        const response = await axios.post(
          `${
            REACT_APP_API_PYTHON_URL
              ? REACT_APP_API_PYTHON_URL
              : "https://razorcopy-py.sitepreviews.dev"
          }/generate-preview`,
          payload
        );

        if (response.data) {
          toast.success("Outline generated successfully!");
          setOutlineContent(response.data);
          setShowOutlineModal(true);
        } else {
          throw new Error("Failed to generate outline");
        }
      } catch (error) {
        console.error("Error generating outline:", error);
        // More detailed error message
        const errorMessage = error.response?.data?.detail
          ? `Failed to generate outline: ${JSON.stringify(
              error.response.data.detail
            )}`
          : "Failed to generate outline. Please try again.";
        toast.error(errorMessage);
      } finally {
        toast.dismiss();
      }
    };

    const regenerateTask = (taskId, taskData) => {
      console.log("Task DATA:", taskData);

      try {
          // Parse the keywords string - remove outer quotes
          const keywordString = taskData.keywords?.replace(/^"|"$/g, "") || "";

          // Parse competitors string - remove outer quotes and parse JSON
          const competitorsString = taskData.competitors_websites?.replace(/^"|"$/g, "") || "[]";
          let competitorsArray = [];
          try {
              competitorsArray = JSON.parse(competitorsString.replace(/\\/g, ""));
          } catch (parseError) {
              console.error("Failed to parse competitors string:", parseError);
              competitorsArray = [];
          }

          // Create payload with the correct field names
          const params = {
              client_site_url: taskData.website_url || "",
              competitor_urls: competitorsArray,
              keywords: [keywordString],
          };

          // Call API to generate titles
          APIService.generateTitles(params)
              .then((response) => {
                  if (response.data?.status) {
                      // Get the first title from the response
                      const newTitle = response.data.data.titles
                          .split("\n")[0]
                          .trim()
                          .replace(/^[0-9]+[\.\-\s]*/, "") // Remove leading numbers, dots, or dashes
                          .replace(/^\-\s*/, "") // Remove leading dash
                          .replace(/"/g, ""); // Remove double quotes

                      // Prepare update parameters
                      const updateParams = {
                          taskid: taskId,
                          name: newTitle,
                          description: taskData.description || "", // Preserve existing description
                      };

                      console.log("Updating task with:", updateParams);

                      // Update the task with the new title
                      APIService.updateTask(updateParams)
                          .then((updateResponse) => {
                              if (updateResponse.data?.status) {
                                  // Update the task list with the new title
                                  setTaskList((prevTasks) =>
                                      prevTasks.map((task) =>
                                          task.id === taskId
                                              ? {
                                                    ...task,
                                                    name: newTitle,
                                                    original: {
                                                        ...task.original,
                                                        name: newTitle,
                                                    },
                                                }
                                              : task
                                      )
                                  );

                                  toast.success("Task regenerated and updated successfully", {
                                      position: toast.POSITION.TOP_RIGHT,
                                  });
                              } else {
                                  toast.error("Failed to update task title", {
                                      position: toast.POSITION.TOP_RIGHT,
                                  });
                              }
                          })
                          .catch((error) => {
                              console.error("Update Task Error:", error);
                              toast.error("Failed to update task title", {
                                  position: toast.POSITION.TOP_RIGHT,
                              });
                          });
                  } else {
                      toast.error(response.data?.message || "Failed to regenerate task", {
                          position: toast.POSITION.TOP_RIGHT,
                      });
                  }
              })
              .catch((error) => {
                  console.error("Regenerate Error:", error);
                  toast.error("An error occurred while regenerating task", {
                      position: toast.POSITION.TOP_RIGHT,
                  });
              });
      } catch (error) {
          console.error("Parsing Error:", error);
          toast.error("Error processing task data", {
              position: toast.POSITION.TOP_RIGHT,
          });
      }
  };

    const handlePublish = () => {
        if (publishUrl.trim() !== "") {
          updateTaskStatus(taskToPublish, 5, publishUrl); // Use the parent's function
          setShowPublishModal(false);
          setPublishUrl("");
        } else {
          toast.error("Please enter a valid URL", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      };  


    const handleAssignToSearch = (value) => {
        setAssignToSearch(value);
        filterDropdownOptionByName(staffList, value, setStaffListForFilter);
      };

    const onAssignBySelectOnTask = (e) => {
        handleAssignToSearch("");
        let id = parseInt(e);
        if (id > 0) {
          let addRemovechk =
            selectedAssignedByOnTask.filter(function (arr) {
              return arr.id === id;
            }).length > 0;
          if (!addRemovechk) {
            let newstaffList = staffListOnTask.filter(function (arr) {
              return arr.id === id;
            });
            setSelectedAssignedByOnTask(
              selectedAssignedByOnTask.concat(newstaffList)
            );
            let params = {};
            params["taskid"] = dropdownOpen;
            params["assigned_members"] = `${id}`;
            params["remove"] = 0;
            APIService.updateAssignMembers(params).then((response) => {});
          } else {
            let newstaffList = selectedAssignedByOnTask.filter(function (arr) {
              return arr.id !== id;
            });
            if (newstaffList.length > 0) {
              setSelectedAssignedByOnTask(newstaffList);
              let params = {};
              params["taskid"] = dropdownOpen;
              params["assigned_members"] = `${id}`;
              params["remove"] = 1;
              APIService.updateAssignMembers(params).then((response) => {});
            } else {
              toast.error(
                "Assigned to is required fields so need to be at least one",
                {
                  position: toast.POSITION.TOP_RIGHT,
                }
              );
            }
          }
        }
      };

      const handleAllProjectAssignMembersOnTask = (
        e,
        taskId,
        projectId,
        AlreadyAssignMembers
      ) => {
        e.preventDefault();
    
        setDropdownOpen(taskId);
        setSelectedAssignedByOnTask(AlreadyAssignMembers);
    
        setStaffListOnTask([]);
        setStaffListForFilterOnTask([]);
    
        APIService.getAllProjectMembers(projectId).then((response) => {
          if (response.data?.status) {
            setStaffListOnTask(response.data?.data);
            setStaffListForFilterOnTask(response.data?.data);
          } else {
            setStaffListOnTask([]);
            setStaffListForFilterOnTask([]);
          }
        });
      };

    const handleActionChange = (taskId, actionValue, description) => {
        const params = {
          taskid: taskId, // Ensure this matches the expected parameter name in the backend
          action_value: actionValue,
          status: 1, // Set the status to "0"
          description: description,
        };
    
        APIService.updateTask(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success("Action updated successfully", {
                position: toast.POSITION.TOP_RIGHT,
              });
              setRefreshForNewPage(!refreshForNewPage); // Refresh the task list
            } else {
              toast.error("Failed to update action", {
                position: toast.POSITION.TOP_RIGHT,
              });
            }
          })
          .catch((error) => {
            toast.error("An error occurred", {
              position: toast.POSITION.TOP_RIGHT,
            });
          });
      };

    const handleLoadMore = async (e) => {
        setPage(page + 1);
        setPerPageSize(perPageSize + pagination.perPageRecord);
        setProcess(true);
    };

    const copyTaskLink = (taskId, task_type) => {
        if (task_type === 1) {
            navigator.clipboard.writeText(`${window.location.origin}/view-site-addons-task/${taskId}`);
        }
        else {
            navigator.clipboard.writeText(`${window.location.origin}/view-task/${taskId}`);
        }
        toast.success(COPY_LINK_MSG, { position: toast.POSITION.TOP_RIGHT });
    };

    let columns = [
        {
            Header: '#',
            id: 'id',
            disableSortBy: false,
            accessor: (taskList) => taskList.name,
            Cell: ({ row }) => (
                <div className="p-3">
                    <div onClick={() => { cstShowViewTaskModal(row?.original?.id) }} className="cursor-pointer d-flex align-items-center form-check-md mb-0">
                        {row?.original?.id}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Name',
            id: 'name',
            accessor: (taskList) => taskList.name,
            Cell: ({ row }) => (
                <div className="p-3">
                    <div
                        onClick={() => { cstShowViewTaskModal(row?.original?.id) }}
                        className="cursor-pointer d-flex flex-column align-items-start"
                    >
                        <div className="list-table-task-name d-flex align-items-start">
                            <div className="d-flex flex-column align-items-start">
                                <div className="list-table-task-name">{row?.original?.name}</div>
                                <Link
                                    to={`/project-detail/${row?.original?.project_id}`}
                                    className="font-12 my-1"
                                >
                                    {row?.original?.project_name}
                                </Link>
                                {row?.original?.recurring === 1 && (
                                    <Badge bg="info" className="font-weight-semibold font-12 p-2 mt-1">
                                        Recurring Task
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="row-action mt-1">
                        <span
                            className='text-primary cursor-pointer'
                            onClick={() => { copyTaskLink(row?.original?.id, row?.original?.task_type) }}
                        >
                            Copy Link
                        </span>
                        
                        <span className="font-12 px-1">|</span>
                        <Link
                            to={row?.original?.task_type === 1 ? `/view-site-addons-task/${row?.original?.id}` : `/view-task/${row?.original?.id}`}
                            target="_blank"
                            className='text-primary cursor-pointer'
                        >
                            View
                        </Link>
                        {check(['tasks.update'], userData?.role.getPermissions) || check(['tasks.delete'], userData?.role.getPermissions) ? (
                            <span className="font-12 px-1">|</span>
                        ) : ''}
                        {check(['tasks.update'], userData?.role.getPermissions) && (
                            <>
                                {userData?.role_code !== databaseRoleCode.clientCode || row?.original?.settings?.edit_tasks === 1 ? (
                                    <span
                                        className='text-primary cursor-pointer'
                                        onClick={() => { cstShowEditTaskModal(row?.original?.id) }}
                                    >
                                        Edit
                                    </span>
                                ) : ''}
                            </>
                        )}
                        {check(['tasks.update'], userData?.role.getPermissions) && check(['tasks.delete'], userData?.role.getPermissions) && (
                            <span className="font-12 px-1">|</span>
                        )}
                        {check(['tasks.delete'], userData?.role.getPermissions) && (
                            <>
                                {userData?.role_code !== databaseRoleCode.clientCode || (userData?.role_code === databaseRoleCode.clientCode && row?.original?.added_by === userData?.id && row?.original?.is_added_from_contact === 1) ? (
                                    <span
                                        className="text-danger cursor-pointer"
                                        onClick={() => { deleteTask(row?.original?.id) }}
                                    >
                                        Delete
                                    </span>
                                ) : ''}
                            </>
                        )}
                        <span className="font-12 px-1">|</span>
                        <span
                          className="text-success cursor-pointer"
                          onClick={() => {
                            regenerateTask(row?.original?.id, row?.original);
                          }}
                        >
                          Regenerate
                        </span>
                        <span className="font-12 px-1">|</span>
                        <span
                          className="text-secondary cursor-pointer"
                          onClick={() => {
                            outlineTask(row?.original?.id, row?.original);
                          }}
                        >
                          Outline
                        </span>
                    </div>
                </div>
            ),
        },
        {
            Header: "Keyword",
            id: "keywords",
            disableSortBy: false,
            accessor: (taskList) => taskList.keywords,
            Cell: ({ row }) => (
              <div className="p-3">
                <div>
                  {row?.original?.keywords
                    ? row.original.keywords.replace(/"/g, "").split(",").join(", ")
                    : "No Keywords"}
                </div>
              </div>
            ),
        },
        {
            Header: "Volume",
            id: "keyword_volume",
            disableSortBy: false,
            accessor: (taskList) => taskList.keyword_volume,
          },
          {
            Header: "Keyword Difficulty",
            id:"keyword_difficulty",
            disableSortBy: false,
            accessor: (taskList) => taskList.keyword_difficulty,
          },
        // {
        //     Header: 'Start Date',
        //     id: 'startdate',
        //     accessor: (taskList) => taskList.startdate && moment(taskList.startdate).format(display_date_format),
        // },
        // {
        //     Header: 'Due Date',
        //     id: 'duedate',
        //     accessor: (taskList) => taskList.duedate && moment(taskList.duedate).format(display_date_format),
        // },
        {
            Header: 'Priority Order',
            id: 'priority',
            accessor: (taskList) => taskList.priority,
        },
        {
            Header: "Status",
            id: "status",
            disableSortBy: false,
            accessor: (taskList) => taskList.task_status_name,
            Cell: ({ row }) => (
                <div className="p-3">
                    {check(["tasks.update"], userData?.role.getPermissions) ? (
                        <Dropdown>
                            <Dropdown.Toggle
                                size="sm"
                                variant={row?.original?.backgroundColor}
                                id={`dropdown-variants-status-${row?.original?.id}`}
                                className="custom-btn-radius"
                            >
                                {row?.original?.task_status_name}
                            </Dropdown.Toggle>
    
                            <Dropdown.Menu popperConfig={popperConfig}>
                                {taskStatusList
                                    .filter(
                                        (status) => status.label !== row?.original?.task_status_name
                                    )
                                    .filter((status) =>
                                        source === "mytask"
                                            ? status.label === "Pending Approval" || status.label === "Rejected"
                                            : status.label !== "Pending Approval" && status.label !== "Rejected"
                                    )
                                    .map((status, index) => (
                                        <Dropdown.Item
                                            key={index}
                                            onClick={() => {
                                                if (source === "articlepage" && status.label === "Published") {
                                                    setTaskToPublish(row?.original?.id);
                                                    setShowPublishModal(true);
                                                } else {
                                                    updateTaskStatus(row?.original?.id, status.id);
                                                }
                                            }}
                                        >
                                            {`Mark as ${status.label}`}
                                        </Dropdown.Item>
                                    ))}
                                {source === "mytask" && (
                                    <Dropdown.Item
                                        onClick={() => {
                                            handleActionChange(row?.original?.id, 1);
                                        }}
                                    >
                                        Mark as Approved
                                    </Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    ) : (
                        <Badge
                            className="font-weight-semibold font-12 p-2"
                            bg={row?.original?.backgroundColor}
                        >
                            {row?.original?.task_status_name}
                        </Badge>
                    )}
                </div>
            ),
        }
    ];

    if (userData?.role_code !== databaseRoleCode.clientCode) {
        columns = [
          ...columns,
          {
            Header: "Assigned to",
            id: "assigned_to",
            disableSortBy: true,
            accessor: (taskList) => taskList.assign_member,
            Cell: ({ row }) => (
              <>
                <div className="avatar-group">
                  {row?.original?.assign_member
                    ?.sort((a, b) =>
                      a.id === row?.original?.added_by
                        ? -1
                        : b.id === row?.original?.added_by
                        ? 1
                        : 0
                    )
                    .map((user, index) => {
                      return (
                        index < 5 && (
                          <span
                            className="avatar avatar-sm avatar-circle"
                            key={index}
                          >
                            {userData.role_code !== databaseRoleCode.clientCode &&
                            userData.role_code !== databaseRoleCode.agencyCode &&
                            userData.role_code !==
                              databaseRoleCode.agencyMemberCode ? (
                              <Link
                                to={`${
                                  user.is_not_staff === 1
                                    ? "/agency-user-detail/"
                                    : "/user-detail/"
                                }${user.id}`}
                              >
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id={`tooltip-${user.name}`}>
                                      {" "}
                                      {user.name}
                                    </Tooltip>
                                  }
                                >
                                  {user.profile_image !== "" &&
                                  user.profile_image !== null ? (
                                    <ReactImageFallback
                                      src={`${user.profile_image}`}
                                      fallbackImage={AvatarImg}
                                      initialImage={AvatarImg}
                                      alt={user.name}
                                      className={`avatar-img ${
                                        user?.id === row?.original?.added_by
                                          ? "border-orange-500"
                                          : ""
                                      } `}
                                    />
                                  ) : (
                                    <img
                                      className={`avatar-img ${
                                        user?.id === row?.original?.added_by
                                          ? "border-orange-500"
                                          : ""
                                      } `}
                                      src={AvatarImg}
                                      alt={user.name}
                                    />
                                  )}
                                </OverlayTrigger>
                              </Link>
                            ) : (
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-${user.name}`}>
                                    {" "}
                                    {user.name}
                                  </Tooltip>
                                }
                              >
                                {user.profile_image !== "" &&
                                user.profile_image !== null ? (
                                  <ReactImageFallback
                                    src={`${user.profile_image}`}
                                    fallbackImage={AvatarImg}
                                    initialImage={AvatarImg}
                                    alt={user.name}
                                    className={`avatar-img ${
                                      user?.id === row?.original?.added_by
                                        ? "border-orange-500"
                                        : ""
                                    } `}
                                  />
                                ) : (
                                  <img
                                    className={`avatar-img ${
                                      user?.id === row?.original?.added_by
                                        ? "border-orange-500"
                                        : ""
                                    } `}
                                    src={AvatarImg}
                                    alt={user.name}
                                  />
                                )}
                              </OverlayTrigger>
                            )}
                          </span>
                        )
                      );
                    })}
    
                  {check(["tasks.update"], userData?.role.getPermissions) &&
                  (userData?.role_code !== databaseRoleCode.clientCode ||
                    row?.original?.settings?.edit_tasks === 1) ? (
                    <span className="avatar avatar-sm avatar-circle">
                      <Dropdown
                        className="assigned-drop-down dropdown"
                        onToggle={(isOpen) =>
                          setDropdownOpen(isOpen ? row?.original?.id : false)
                        }
                        autoClose="outside"
                        show={dropdownOpen === row?.original?.id}
                        onSelect={onAssignBySelectOnTask}
                      >
                        <Dropdown.Toggle
                          as="a"
                          bsPrefix="no-toggle"
                          className="dark-2 font-weight-medium font-12 cursor-pointer"
                          id="assign"
                        >
                          <img
                            className="avatar-img"
                            alt="Profile"
                            src={AdddashedIcon}
                            onClick={(e) =>
                              handleAllProjectAssignMembersOnTask(
                                e,
                                row?.original?.id,
                                row?.original?.project_id,
                                row?.original?.assign_member
                              )
                            }
                          />
                        </Dropdown.Toggle>
    
                        {staffListForFilterOnTask.length > 0 && (
                          <Dropdown.Menu as="ul" className="p-2">
                            {/* <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                                        <div className="search-box w-100">
                                                            <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                                <img src={SearchIcon} alt="Search" />
                                                                <input type="search" id={`search-${row?.original?.id}`} className="form-control border-0" placeholder="Name" value={assignToSearchOnTask} onChange={(e) => handleAssignToSearchOnTask(e, e.target.value)} autoFocus={assignToSearchOnTask.length > 0} onFocus={(e) => e.target.setSelectionRange(assignToSearchOnTask.length, assignToSearchOnTask.length)} />
    
                                                            </div>
                                                        </div>
                                                    </Dropdown.Header> */}
    
                            <SimpleBar className="dropdown-body">
                              {staffListForFilterOnTask.map((drp, index) => (
                                <Dropdown.Item
                                  as="li"
                                  key={index}
                                  eventKey={drp.id}
                                  className={`${
                                    selectedAssignedByOnTask.filter(function (arr) {
                                      return arr.id === drp.id;
                                    }).length > 0
                                      ? "active"
                                      : ""
                                  }`}
                                >
                                  <div className="d-flex d-flex align-items-center cursor-pointer w-100">
                                    {drp.profile_image !== "" &&
                                    drp.profile_image !== null ? (
                                      <img
                                        className="avatar avatar-xs avatar-circle me-1"
                                        src={`${drp.profile_image}`}
                                        alt={drp.name}
                                        onError={({ currentTarget }) => {
                                          currentTarget.onerror = null;
                                          currentTarget.src = AvatarImg;
                                        }}
                                      />
                                    ) : (
                                      <img
                                        className="avatar avatar-xs avatar-circle me-1"
                                        src={AvatarImg}
                                        alt={drp.name}
                                      />
                                    )}
                                    <div className="ps-3">
                                      <div className="font-weight-regular dark-1 font-14 d-block">
                                        {drp.name}
                                      </div>
                                    </div>
                                  </div>
                                </Dropdown.Item>
                              ))}
                            </SimpleBar>
                          </Dropdown.Menu>
                        )}
                      </Dropdown>
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </>
            ),
          },
          // {
          //   Header: "Action",
          //   id: "action",
          //   disableSortBy: true,
          //   Cell: ({ row }) => (
          //     <>
          //       <OverlayTrigger
          //         placement="top"
          //         overlay={
          //           <Tooltip id={`tooltip-approve-${row?.original?.id}`}>
          //             Approve
          //           </Tooltip>
          //         }
          //       >
          //         <Button
          //           variant="success"
          //           size="sm"
          //           onClick={() =>
          //             handleActionChange(
          //               row?.original?.id,
          //               1,
          //               row?.original?.description
          //             )
          //           } // Use existing description from row
          //           disabled={row?.original?.action === 1}
          //           className="me-2" // Bootstrap class for margin-end
          //         >
          //           <i className="fa fa-check"></i>
          //         </Button>
          //       </OverlayTrigger>
          //       <OverlayTrigger
          //         placement="top"
          //         overlay={
          //           <Tooltip id={`tooltip-reject-${row?.original?.id}`}>
          //             Reject
          //           </Tooltip>
          //         }
          //       >
          //         <Button
          //           variant="danger"
          //           size="sm"
          //           onClick={() => handleReject(row?.original?.id)}
          //           disabled={row?.original?.action === 0}
          //         >
          //           <i className="fa fa-times"></i>
          //         </Button>
          //       </OverlayTrigger>
          //     </>
          //   ),
          // },
        ];
      }

    /*columns = [
        ...columns,
        {
            Header: 'Action',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <Dropdown className="category-dropdown edit-task-dropdown">
                        <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><i className="fa-solid fa-ellipsis-vertical"></i></Dropdown.Toggle>
                        <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                            {check(['tasks.update'], userData?.role.getPermissions) &&
                                <>
                                    {userData?.role_code !== databaseRoleCode.clientCode || row?.original?.settings?.edit_tasks === 1 ?
                                        <>
                                            {taskStatusList.filter(function (arr) { return arr.label !== heading; }).map((status, index) => (
                                                <Dropdown.Item key={index} onClick={() => { updateTaskStatus(row?.original?.id, status.id) }}>
                                                    {`Mark as ${status.label}`}
                                                </Dropdown.Item>
                                            ))}

                                            <Dropdown.Item onClick={() => { cstShowEditTaskModal(row?.original?.id) }}>
                                                Edit Task
                                            </Dropdown.Item>
                                        </> : ''
                                    }
                                </>
                            }
                            {check(['tasks.view'], userData?.role.getPermissions) &&
                                <>
                                    {userData?.role_code !== databaseRoleCode.clientCode || row?.original?.settings?.view_tasks === 1 ?
                                        <Dropdown.Item onClick={() => { cstShowViewTaskModal(row?.original?.id) }}>
                                            View Task
                                        </Dropdown.Item> : ''
                                    }
                                </>
                            }
                            {check(['tasks.delete'], userData?.role.getPermissions) &&
                                <>
                                    <Dropdown.Item className="text-danger" onClick={() => { deleteTask(row?.original?.id) }}>
                                        Delete Task
                                    </Dropdown.Item>
                                </>
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </>
            ),
        }
    ];*/

    const getData = async (e) => {
        let search_by_status = id;
        let task_type_new = userData?.role_code === databaseRoleCode.clientCode ? '0,1' : task_type;
        let params = "?assigned_to_me=" + assigned_id + "&search_by_status=" + search_by_status + "&task_type=" + task_type_new + "&my_following_tasks=" + myFollowingTasks;
        params = params + "&sort=" + sort + "&limit=" + pagination.perPageRecord + "&page=" + page + "&sort_by=" + sortby;
        if (recurringTask) {
            params = params + "&recurring=1";
        }
        if (project !== '') {
            params = params + "&search_by_project=" + project.id;
        }
        if (agency !== '') {
            params = params + "&search_by_agency=" + agency.id;
        }
        if (staffId.length > 0) {
            let staff_id_list = staffId.map((obj) => obj.id);
            params = params + "&staffid=" + staff_id_list.join(",");
        }
        params = params + `&customer_id=${customerId ? customerId : 0}`;

        APIService.getTaskList(params)
            .then((response) => {
                if (response.data?.status) {
                    setShowButton(response.data?.pagination?.total_pages > page);
                    let newData = [];
                    if (page === 1) {
                        newData = response.data?.data;
                    }
                    else {
                        newData = taskList.concat(response.data?.data);
                    }
                    setProcess(false);
                    setTaskList(newData);
                }
            });
    }

    useEffect(() => {
        setTaskList(taskStatusDataList);
        setShowButton(taskStatusDataList.length > 4);
    }, [taskStatusDataList]);

    useEffect(() => {
        setFirstLoad(false);
        if (!firstLoad) {
            getData();
        }
    }, [sort, sortby, searchFilter, page]);

    return (
        <>
    <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
            <Accordion.Header as="h4">
                {heading}
                {/* <Badge pill className='ms-2 status-badge' bg="info">{total_task}</Badge> */}
            </Accordion.Header>
            <Accordion.Body className="pt-0">
                <div className={`card rounded-10 p-6 all-dev-task all-dev-task-without-checkbox`}>
                    {/* When sorting or load more then taskList state will update and below table will show data */}
                    {taskList &&
                        <DataTable columns={columns} data={taskList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={1} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={false} isPagination={false} isLengthChange={false} showButton={showButton} handleLoadMore={handleLoadMore} btnProcess={process} setSort={setSort} setSortingBy={setSortBy} />
                    }
                </div>
            </Accordion.Body>
        </Accordion.Item>
    </Accordion>
    {showOutlineModal && (
        <Modal
          show={showOutlineModal}
          onHide={() => setShowOutlineModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Generated Outline</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div
              dangerouslySetInnerHTML={{
                __html: formatOutlineContent(outlineContent), // Use the formatting function
              }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => saveOutlineAsDescription(outlineContent)}
            >
              Save Outline
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowOutlineModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    <Modal
        show={showPublishModal}
        onHide={() => setShowPublishModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Enter URL for Publishing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="publishUrl">
              <Form.Label>URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="Enter URL"
                value={publishUrl}
                onChange={(e) => setPublishUrl(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPublishModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePublish}>
            Publish
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    );
}
