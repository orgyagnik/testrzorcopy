import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Form, Dropdown, Button, Offcanvas, Card, Spinner, OverlayTrigger, Tooltip, Ratio, DropdownButton, Badge } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import APIService from "../../api/APIService";
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import moment from 'moment';
import { display_date_format, databaseRoleCode, frontendDeveloperId, backendDeveloperId, seoDeveloperId, pagination, designationExcludeList, display_date_format_with_time } from '../../settings';
import AttaZipImg from "../../assets/img/zip.png";
import AttaPdfImg from "../../assets/img/pdf.png";
import AttaDocImg from "../../assets/img/doc.png";
import AttaExcelImg from "../../assets/img/excel.png";
import { getFileExtensionFromFileName, check, replaceSpecialCharacters } from "../../utils/functions.js";
import { confirmAlert } from 'react-confirm-alert';
import { setFavoritesTask } from "../../store/reducers/App";
import Store from "../../store";
import { DELETE_TASK_COMMENT, COPY_LINK_MSG } from '../../modules/lang/Task';
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";
import TaskComment from './TaskComment';
import { DELETE_ATTACHMENT, ASSIGNEDTO_MSG } from '../../modules/lang/Task';
import TaskAccessDenied from './TaskAccessDenied';
import UpdateAssignMember from './UpdateAssignMember';
import UpdateFollowers from './UpdateFollowers';
import linkifyHtml from 'linkify-html';
import { Link } from "react-router-dom";
import AddTaskCommentForm from './AddTaskCommentForm';
import TaskChecklistItems from './TaskChecklistItems';
import AttaSvgImg from "../../assets/img/svg.png";
import axios from 'axios';

function ViewTaskModal({ fromArticlePage, fromMytask, showApproveOption, generatedContent, showArticleSection, showViewTaskModal, setShowViewTaskModal, taskId, setRefreshForNewPage, refreshForNewPage, task_type, siteAddonURL, tasksURL, favouriteURL, userData, cstShowEditTaskModal, deleteTask, showRatingModal, search, setTaskId, isArticleView, showArticle }) {
  let commentLoad = window.location.hash;
  const cstSetCloseViewTaskModal = () => {
    if (task_type === 1)
      window.history.replaceState(null, '', `${siteAddonURL}${search}`);
    else if (task_type === 3)
      window.history.replaceState(null, '', `${favouriteURL}${search}`);
    else
      window.history.replaceState(null, '', `${tasksURL}${search}`);
    setShowViewTaskModal(false);
    if (updateAssignCount) {
      setRefreshForNewPage(!refreshForNewPage);
    }
    setUpdateAssignCount(false);
    setTimeout(() => {
      setTaskData(null);
      setAgencyMode(false);
      clearCommentSection();
      if(window.location.pathname === "/tasks") {
        setTaskId(0);
      }
    }, 500);
  };
  const simpleBarRef = useRef();
  const [taskData, setTaskData] = useState(null);

  const [taskStatus, setTaskStatus] = useState(null);
  const [agencyMode, setAgencyMode] = useState(false);
  const [updateAssignCount, setUpdateAssignCount] = useState(false);
  const [taskComment, setTaskComment] = useState(null);
  const [taskCommentProcess, setTaskCommentProcess] = useState(true);
  const [attachmentsFile1, setAttachmentsFile1] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const [commentVisibleToClient, setCommentVisibleToClient] = useState(userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.agencyMemberCode && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.adminCode && userData?.role_code !== databaseRoleCode.pcCode && userData?.role_code !== databaseRoleCode.accountantCode);
  const [hideCommentForm, setHideCommentForm] = useState(true);
  //const [refreshModal, setRefreshModal] = useState(false);
  const [refreshComment, setRefreshComment] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [favoriteTask, setFavoriteTask] = useState(0);
  const [taskStatusList, setTaskStatusList] = useState([]);
  const [addCheckListItemProcess, setAddCheckListItemProcess] = useState(false);

  // for assign to
  const [selectedAssignedBy, setSelectedAssignedBy] = useState([]);
  const [staffListForFilter, setStaffListForFilter] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [selectedFollower, setSelectedFollower] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const [followerListForFilter, setFollowerListForFilter] = useState([]);
  const [checkList, setCheckList] = useState([]);
  const [commentHours, setCommentHours] = useState(checkPermissionForBillableHours() ? '' : "00:00");
  const [loggedDevHours, setLoggedDevHours] = useState('');
  const [loggedBucketHours, setLoggedBucketHours] = useState('');
  const [taskTotalWorkingHours, setTaskTotalWorkingHours] = useState([]);
  const [reloadTaskTotalWorkingHours, setReloadTaskTotalWorkingHours] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showScroll, setShowScroll] = useState(true);
  const [page, setPage] = useState(0);
  const [isOutlineVisible, setIsOutlineVisible] = useState(true);
  const [showProjectInfoModal, setShowProjectInfoModal] = useState(false);
  const [showOutlineModal, setShowOutlineModal] = useState(false);

  const handleShowProjectInfo = () => setShowProjectInfoModal(true);
  const handleCloseProjectInfo = () => setShowProjectInfoModal(false);

  const handleShowOutline = () => setShowOutlineModal(true);
  const handleCloseOutline = () => setShowOutlineModal(false);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishUrl, setPublishUrl] = useState("");
  const [taskToPublish, setTaskToPublish] = useState(null);

  const changeTaskStatusWithUrl = (taskId, statusId, publishUrl = null) => {
    const params = {
      taskid: taskId,
      status: statusId,
      user_entered_url: publishUrl
    };

    APIService.updateTask(params)
      .then((response) => {
        if (response.data?.status) {
          toast.success("Task status updated successfully", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setRefreshForNewPage((prev) => !prev);
          if (statusId === 5) {
            showRatingModal(taskId); // Show the rating modal
          }
        } else {
          toast.error("Failed to update task status", {
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

  const handlePublish = () => {
    if (publishUrl.trim() !== "") {
      changeTaskStatusWithUrl(taskToPublish, 5, publishUrl);
      setShowPublishModal(false);
      setPublishUrl("");
    } else {
      toast.error("Please enter a valid URL", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
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

  const toggleOutlineVisibility = () => {
    setIsOutlineVisible(!isOutlineVisible);
  };

  const formatOutlineContent = (content) => {
      // Example formatting logic (you can customize this as needed)
      return content
      .replace(/(\*\*.*?\*\*):/g, '<h3>$1</h3>') // Convert bold text followed by a colon to h3
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove asterisks from bold text
      .replace(/(\d+\.\s)/g, '<br/>$1') // Convert numbered items to plain text with line breaks
      .replace(/(\n\n)/g, '<br/><br/>') // Convert double newlines to paragraph breaks
      .replace(/(\n)/g, '<br/>'); // Convert single newlines to line breaks
};

  const formatArticleContent = (content) => {
    // Example formatting logic (you can customize this as needed)
    return content
    .replace(/^###\s*(.*)$/gm, '<h3>$1</h3>') // Convert lines starting with ### to h3
    .replace(/^##\s*(.*)$/gm, '<h2>$1</h2>') // Convert lines starting with ## to h2
    .replace(/^#\s*(.*)$/gm, '<h1>$1</h1>') // Convert lines starting with ## to h2
    .replace(/(\*\*.*?\*\*):/g, '<h3>$1</h3>') // Convert bold text followed by a colon to h3
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove asterisks from bold text
    .replace(/(\d+\.\s)/g, '<br/>$1') // Convert numbered items to plain text with line breaks
    .replace(/(\n\n)/g, '<br/><br/>') // Convert double newlines to paragraph breaks
    .replace(/(\n)/g, '<br/>'); // Convert single newlines to line breaks
  };

  const clearTaskViewCache = (id) => {
    let params = {};
    params["taskid"] = id;
    APIService.clearTaskViewCache(params)
        .then((response) => {
          if (response.data?.status) {            
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });            
            window.location.reload();
          }else {
            toast.error(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
          }
        });
  }

  const updateTaskStatus = (id, status) => {
    let params = { taskid: id, status: status };
    APIService.updateTaskStatus(params)
      .then((response) => {
        if (response.data?.status) {
          /*setRefreshForNewPage(!refreshForNewPage);
          setShowViewTaskModal(false);*/
          setUpdateAssignCount(true);
          let task_status_new = taskStatusList.filter(function (arr) { return arr.id === status; });
          if (task_status_new.length > 0) {
            setTaskStatus({ status: task_status_new[0]?.label, backgroundColor: task_status_new[0]?.backgroundColor });
          }

          toast.success(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
          if (status === 5) {
            showRatingModal(id); // Show the rating modal
            if (task_type === 1)
              window.history.replaceState(null, '', `${siteAddonURL}${search}`);
            else if (task_type === 3)
              window.history.replaceState(null, '', `${favouriteURL}${search}`);
            else
              window.history.replaceState(null, '', `${tasksURL}${search}`);
          }
        } else {
          toast.error(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
        }
      })
      .catch((error) => {
        toast.error("An error occurred", {
          position: toast.POSITION.TOP_RIGHT
        });
      });
  };

  const editTask = (id) => {
    cstSetCloseViewTaskModal();
    cstShowEditTaskModal(id);
  }

  const fetchCheckList = (focus) => {
    let paramsNew = "?";
    paramsNew = paramsNew + "limit=1000&page=1&sort=asc&sort_by=list_order&taskid=" + taskId;
    APIService.getTaskCheckList(paramsNew)
      .then((response) => {
        if (response.data?.status) {
          setCheckList(response.data?.data);
        }
        setAddCheckListItemProcess(false);
        if (focus === 1) {
          setTimeout(() => {
            document.getElementById("checklist-input-0").focus();
          }, 500);
        }
      });
  };

  useEffect(() => {
    clearControl();
    if (showViewTaskModal) {
      APIService.getTaskStatus()
                .then((response) => {
                    if (response.data?.status) {
                        let filteredStatuses;
                        if (isArticleView) {
                            // Show all statuses except "Pending Approval" and "Hold"
                            filteredStatuses = response.data.data.filter(status => 
                                status.label !== "Pending Approval" && status.label !== "Rejected"
                            );
                        } else {
                            // Show only "Pending Approval" and "Hold"
                            filteredStatuses = response.data.data.filter(status => 
                                status.label === "Pending Approval" || status.label === "Rejected"
                            );
                        }
                        setTaskStatusList(filteredStatuses); // Update the state with filtered statuses
                    }
                });

      APIService.getTaskById(taskId)
        .then((response) => {
          if (response.data?.status) {
            let data = response.data?.data;
            setSelectedAssignedBy(data.assigned_members);
            setSelectedFollower(data.assigned_followers);
            APIService.getAllProjectMembers(data.project_id)
              .then((response) => {
                if (response.data?.status) {
                  setStaffList(response.data?.data);
                  setStaffListForFilter(response.data?.data);
                }
                else {
                  setStaffList([]);
                  setStaffListForFilter([]);
                }
              });
            APIService.getAllMembers('')
              .then((response) => {
                if (response.data?.status) {
                  setFollowerList(response.data?.data);
                  setFollowerListForFilter(response.data?.data);
                }
              });
            /*if (data['description'] !== undefined) {
              data['description'] = data?.description.replaceAll("<a ", "<a rel='nofollow' target='_blank' ");
            }*/
            setTaskData(data);
            setTaskStatus({ status: data?.task_status_name, backgroundColor: data?.backgroundColor });
            setFavoriteTask(data.favorite);
            setFirstLoad(false);
            setLoggedDevHours(checkPermissionForLoggedDevHours(data?.current_plan) ? '' : "00:00");
            setLoggedBucketHours(checkPermissionForLoggedBucketHours(data?.current_plan) ? '' : "00:00");

            //for simplebar scrolling

            setTimeout(() => {
              const simpleBarInstance = simpleBarRef.current.getScrollElement();
              setPage(1);
              simpleBarInstance.addEventListener('scroll', handlesimpleBarScroll);
              return () => {
                simpleBarInstance.removeEventListener('scroll', handlesimpleBarScroll);
              };
            }, 500);
          }
        });

      fetchCheckList(0);
    }
  }, [showViewTaskModal, taskId, isArticleView]);
  //}, [showViewTaskModal, refreshModal]);

  useEffect(() => {
    if (showViewTaskModal) {
      APIService.getTaskTotalHours(taskId)
        .then((response) => {
          if (response.data?.status) {
            let data = response.data?.data;
            setTaskTotalWorkingHours({ comment_total_billable_hours: data?.comment_total_billable_hours, comment_total_bucket_logged_hours: data?.comment_total_bucket_logged_hours, comment_total_dev_logged_hours: data?.comment_total_dev_logged_hours });
          }
        });
    }
  }, [reloadTaskTotalWorkingHours, showViewTaskModal, taskId]);


  const loadMoreComments = async (e) => {
    setTaskCommentProcess(true);

    const hashValue = window.location.hash.substr(1); // Extract the value after #
      
    if (hashValue == null || hashValue == ""){
      var pagelimit = pagination.perPageRecordForComment;
    } else { 
      var pagelimit = 1000;
    }

    if (showViewTaskModal && page > 0) {
      APIService.getTaskComment(`?taskid=${taskId}&agency_mode=${agencyMode ? 1 : 0}&limit=${pagelimit}&page=${page}`)
        .then((response) => {
          if (response.data?.status) {
            const newTaskComments = response.data?.data;
            const totalPages = response.data?.pagination?.total_pages || 0;
            if (newTaskComments && newTaskComments.length > 0 && (page <= totalPages)) {
              setShowScroll(totalPages > page);
              let newData = [];
              if (page === 1) {
                newData = newTaskComments;
              }
              else {
                newData = taskComment?.concat(newTaskComments);
              }
              setTaskComment(newData);
            } else {
              setShowScroll(false);
            }
            setTaskCommentProcess(false);

            const timeout = setTimeout(() => {
              const hashValue = window.location.hash.substr(1); // Extract the value after #
              
              const element = document.getElementById(hashValue);

              if (element) { 
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }, 1500);
          }
        });
    }
  };

  useEffect(() => {
  }, [favoriteTask, taskId, showViewTaskModal, agencyMode]);

  useEffect(() => {
    loadMoreComments();
  }, [page]);

  useEffect(() => {
    if (commentLoad !== undefined && commentLoad !== '' && !commentLoad.includes("comment_")) {
      clearCommentSection();
      setTimeout(() => {
        setPage(1);
      }, 500);
    }
  }, [commentLoad]);

  function checkPermissionForBillableHours() {
    // if( ((userData?.role_code !== databaseRoleCode.agencyCode || userData?.role_code !== databaseRoleCode.agencyMemberCode || userData?.role_code !== databaseRoleCode.clientCode ) && (!designationExcludeList.includes(userData?.designation_name) )) ){
    //   return true;
    // }
    // return false;
    if( ( (userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.agencyMemberCode && userData?.role_code !== databaseRoleCode.clientCode )) ){
      
      if((!designationExcludeList.includes(userData?.designation_name) )){        
        return true;
      }else{
        return false;
      }
    }
    return false;
  };

  function checkPermissionForLoggedDevHours(plan = '') {
    if ((userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode) && plan.includes('dev')) {
      return true;
    }
    return false;
  };

  function checkPermissionForLoggedBucketHours(plan = '') {
    if ((userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode) && plan.includes('bucket')) {
      return true;
    }
    return false;
  };

  const clearControl = async () => {
    setFormErrors([]);
    setCommentVisibleToClient(userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.agencyMemberCode && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.adminCode && userData?.role_code !== databaseRoleCode.pcCode && userData?.role_code !== databaseRoleCode.accountantCode);
    setAttachmentsFile1([]);
    setTaskCommentProcess(true);
    setHideCommentForm(true);
    setCommentHours(checkPermissionForBillableHours() ? '' : "00:00");
    setLoggedDevHours(checkPermissionForLoggedDevHours(taskData?.current_plan) ? '' : "00:00");
    setLoggedBucketHours(checkPermissionForLoggedBucketHours(taskData?.current_plan) ? '' : "00:00");
    clearCommentSection();
  }

  const clearCommentSection = async () => {
    setPage(0);
    setTaskComment(null);
    setShowScroll(true);
  }

  const handleDeleteTaskComment = (id) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_TASK_COMMENT,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["commentid"] = id;
            params["current_plan"] = taskData?.current_plan;
            params["task_type"] = task_type;
            params["agency_id"] = taskData?.agency_id;
            APIService.deleteTaskComment(params)
              .then((response) => {
                if (response.data?.status) {
                  setRefreshComment(!refreshComment);
                  setTaskComment(prevTaskComment => prevTaskComment.filter(row => row.id !== id));
                  setReloadTaskTotalWorkingHours(!reloadTaskTotalWorkingHours);
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                }
                else {
                  toast.error(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                }
              });
          }
        },
        {
          label: 'No',
          className: 'btn btn-outline-secondary btn-lg',
          onClick: () => {

          }
        }
      ]
    });
  }

  const changeAgencyMode = () => {
    setRefreshComment(!refreshComment);
    setAgencyMode(!agencyMode);
    clearCommentSection();
    setTimeout(() => {
      setPage(1);
    }, 500);
  };

  const copyTaskLink = () => {
    //navigator.clipboard.writeText(`${window.location.host}/view-task/${taskId}`);
    const currentURL = window.location.pathname;
    if (currentURL === `/view-favourite-task/${taskData?.id}`) {
      if (taskData?.task_type === 1) {
        navigator.clipboard.writeText(`${window.location.origin}/view-site-addons-task/${taskData?.id}`);
      }
      else {
        navigator.clipboard.writeText(`${window.location.origin}/view-task/${taskData?.id}`);
      }
    }
    else {
      navigator.clipboard.writeText(window.location.href);
    }
    toast.success(COPY_LINK_MSG, { position: toast.POSITION.TOP_RIGHT });
  };

  const handleAttachmentClick = async (file) => {
    window.open(file, '_blank', 'noopener,noreferrer');
  }

  const handleAddRemoveFavorite = (status) => {
    let params = {};
    params["taskid"] = parseInt(taskId);
    params["remove"] = status;
    //params["staffid"] = userData.role_code === databaseRoleCode.clientCode ? userData?.userid : userData?.id;
    params["staffid"] = userData?.id;
    APIService.addRemoveFavorite(params)
      .then((response) => {
        if (response.data?.status) {
          setFavoriteTask(status === 0 ? 1 : 0);
          toast.success(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
          APIService.getFavavoriteTasks()
            .then((response) => {
              if (response.data?.status) {
                Store.dispatch(setFavoritesTask(response.data?.data));
              }
            });
          if (task_type === 3) {
            setUpdateAssignCount(true);
          }
        }
        else {
          toast.error(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
        }
      });
  }

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const openImageViewer = useCallback((files, file_path) => {
    setIsViewerOpen(true);
    let selecteImgIndex = 0;
    let mapIndex = 0;
    let Sliderimages = files.map(item => {
      let file_ext = getFileExtensionFromFileName(item.file_path);
      if (file_ext !== 'zip' && file_ext !== 'pdf' && file_ext !== 'doc' && file_ext !== 'docx') {
        if (file_path === item.file_path) {
          selecteImgIndex = mapIndex;
        }
        mapIndex = mapIndex + 1;
        return { url: item.file_path, title: `${item.file_title} | ${item.file_name}` }
      }
      else {
        return { url: '', title: '' }
      }
    });
    Sliderimages = Sliderimages.filter((item) => { return item.url !== '' });
    setStartIndex(selecteImgIndex);
    setViewerImages(Sliderimages);
  }, []);

  const closeImageViewer = () => {
    setIsViewerOpen(false);
  };

  const handleDeleteTaskCommentAttachment = (fileid, id, commentId) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_ATTACHMENT,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["fileid"] = fileid;
            params["id"] = id;
            APIService.removeAttachment(params)
              .then((response) => {
                if (response.data?.status) {
                  setRefreshComment(!refreshComment);
                  setTaskComment((prevComments) =>
                    prevComments.map((comment) =>
                      comment.id === commentId
                        ? {
                          ...comment,
                          attachments: comment.attachments.filter(
                            (attachment) => attachment.id !== fileid
                          ),
                        }
                        : comment
                    )
                  );
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                }
                else {
                  toast.error(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                }
              });

          }
        },
        {
          label: 'No',
          className: 'btn btn-outline-secondary btn-lg',
          onClick: () => {

          }
        }
      ]
    });
  };

  const handleDownloadAttachmentsZip = (id, type) => {
    let paramsNew = "?";
    paramsNew = paramsNew + `id=${id}&type=${type}`;
    APIService.downloadAttachmentsZip(paramsNew)
      .then((response) => {
        if (response.data?.status) {
          let alink = document.createElement('a');
          alink.href = response.data?.data;
          alink.download = response.data?.data;
          alink.click();
        }
        else {
          toast.error("Something went to wrong...", {
            position: toast.POSITION.TOP_RIGHT
          });
        }
      });
  };

  const handlesimpleBarScroll = async (e) => {
    const { target } = e;
    const threshold = 1;
    const isBottomReached = target.scrollHeight - (target.scrollTop + target.clientHeight) <= threshold;
    let prevShowScrollVar = false;
    setShowScroll((prevShowScroll) => {
      prevShowScrollVar = prevShowScroll;
      return prevShowScroll;
    });
    let commentLoader = false;
    setTaskCommentProcess((prevTaskCommentProcess) => {
      commentLoader = prevTaskCommentProcess;
      return prevTaskCommentProcess;
    });
    if (isBottomReached && prevShowScrollVar && !commentLoader) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <>
      {taskData &&
        <>
          {/* {isViewerOpen && (
            <Lightbox
              onClose={closeImageViewer}
              image={viewerImages} />
          )} */}
          {isViewerOpen && (
            <Lightbox
              onClose={closeImageViewer}
              images={viewerImages}
              startIndex={startIndex} />
          )}
          <Offcanvas show={showViewTaskModal} className="add-task-sidebar edit-task-sidebar" enforceFocus={false} placement="end" keyboard={false} onHide={cstSetCloseViewTaskModal}>
            {taskData?.id ?
              <>
                <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                  <div className="d-flex align-items-center task-title-left">
                    <h2 className='mb-0 d-xl-block d-none'>{taskData?.name}</h2>
                    {taskData?.rating !== 0 && taskData?.status === 5 && taskData?.rating !== undefined &&
                      <div className="task-rating ms-8">
                        <i className={`${taskData?.rating >= 1 ? 'icon-star' : 'icon-star-line'}`}></i>
                        <i className={`${taskData?.rating >= 2 ? 'icon-star' : 'icon-star-line'}`}></i>
                        <i className={`${taskData?.rating >= 3 ? 'icon-star' : 'icon-star-line'}`}></i>
                        <i className={`${taskData?.rating >= 4 ? 'icon-star' : 'icon-star-line'}`}></i>
                        <i className={`${taskData?.rating === 5 ? 'icon-star' : 'icon-star-line'}`}></i>
                      </div>
                    }
                  </div>

                  <ul className="ovrlay-header-icons">
                    <li>
                      <OverlayTrigger placement="bottom" overlay={<Tooltip id={`clear-cache`}> Clear Cache</Tooltip>}>
                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { clearTaskViewCache(taskData?.id) }}>
                          <i className="icon-rotate-right"></i>
                        </button>
                      </OverlayTrigger>
                    </li>

                    {(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.role_code === databaseRoleCode.pcCode) ?
                      <li>
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id={`agency-mode`}> {agencyMode ? 'User Mode' : 'Agency Mode'}</Tooltip>}>
                          <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={changeAgencyMode}>
                            {agencyMode ? <i className="icon-user-xmark"></i> : <i className="icon-user-tag"></i>}
                          </button>
                        </OverlayTrigger>
                      </li>
                      : ''}
                    <li>
                      <OverlayTrigger placement="bottom" overlay={<Tooltip id={`copy-link`}> Copy task link</Tooltip>}>
                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={copyTaskLink}>
                          <i className="icon-link"></i>
                        </button>
                      </OverlayTrigger>
                    </li>
                    {check(['tasks.update'], userData?.role.getPermissions) &&
                      <li>
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Edit task</Tooltip>}>
                          <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { editTask(taskData?.id) }}>
                            <i className="icon-edit"></i>
                          </button>
                        </OverlayTrigger>
                      </li>
                    }
                    {check(['tasks.delete'], userData?.role.getPermissions) &&
                      <>
                       {userData?.role_code !== databaseRoleCode.clientCode || (userData?.role_code === databaseRoleCode.clientCode && taskData?.addedfrom === userData?.id && taskData?.is_added_from_contact === 1) ?
                          <li>
                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Delete task</Tooltip>}>
                              <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { deleteTask(taskData?.id) }}>
                                <i className="icon-delete text-danger"></i>
                              </button>
                            </OverlayTrigger>
                          </li>
                        :'' }
                      </>
                    }
                    <li>
                      <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Close task</Tooltip>}>
                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewTaskModal}>
                          <i className="icon-cancel"></i>
                        </button>
                      </OverlayTrigger>
                    </li>
                  </ul>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                  <div className="d-flex flex-xl-nowrap flex-wrap h-100">
                    <div className="left-content p-6 flex-fill order-xl-1 order-2">
                      <SimpleBar className="offcanvas-inner" ref={simpleBarRef}>
                        {taskData?.rating !== 0 && taskData?.status === 5 && taskData?.rating !== undefined &&
                          <>
                            <div className="show-task-description mb-5">
                              <span className="font-14 font-weight-semibold dark-1 d-block mb-3">Review By: {taskData?.ratinguser_name}</span>
                              <div><span className="font-14 font-weight-semibold dark-1 d-block mb-3">Comments: </span>{taskData?.review}</div>
                            </div>
                            <hr />
                          </>
                        }
                        <div className="show-task-description mb-5">
                       {/* {!fromArticlePage &&
                        <span className="font-14 font-weight-semibold dark-1 d-block mb-3" onClick={toggleOutlineVisibility} style={{ cursor: 'pointer' }}>
                          Outline
                          <i className={`fa ${isOutlineVisible ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ marginLeft: '8px' }}></i>
                        </span>
                        }
                        {!fromArticlePage && isOutlineVisible && (
  <div
    dangerouslySetInnerHTML={{
      __html: formatOutlineContent(
        replaceSpecialCharacters(
          linkifyHtml(
            taskData?.generated_outline && taskData?.generated_outline !== undefined && taskData?.generated_outline !== "undefined"
              ? taskData?.generated_outline
              : '<p class="text-muted">No outline for this task</p>'
          )
        ).replaceAll("<a ", "<a rel='nofollow' target='_blank' ")
      )
    }}
  />
)} */}
                       {/* <span className="font-14 font-weight-semibold dark-1 d-block mb-3" style={{ cursor: 'pointer' }}>
                              Article
                            </span> */}
                            {taskData?.google_doc_url ? (
                              <div style={{height: "calc(100vh - 150px)" }}> {/* Adjust height as needed */}
                                <iframe 
                                  src={`${taskData?.google_doc_url}?embedded=true`} 
                                  width="100%" 
                                  height="100%" 
                                  style={{ border: "none", minHeight: "800px", display: "block" }} 
                                  allow="autoplay"
                                ></iframe>
                              </div>
                            ) : (
                              <p className="text-muted">No article for this task</p>
                            )}
                      </div>
                        {userData?.role_code !== databaseRoleCode.clientCode || taskData?.settings?.view_task_attachments === 1 ?
                          taskData?.attachments.length > 0 &&
                          <div className="show-task-attachments mt-7 mb-5">
                            <span className="font-14 font-weight-semibold dark-1 d-inline-block mb-4">Attachments</span>
                            <Button variant="outline-secondary" className="btn btn-outline-secondary btn-sm ms-2" type="button" onClick={() => { handleDownloadAttachmentsZip(taskId, 'task') }}><i className="icon-download me-2"></i>Download All (.zip)</Button>
                            <div className="row g-3">
                              {taskData?.attachments.map((file, index) => {
                                let file_ext = getFileExtensionFromFileName(file.file_path);
                                return <div className="col-6 col-sm-3 col-md-3 col-lg-3 col-xxl-2 text-center" key={index}>
                                  <div className='attachment_div'>
                                    <Card className="border border-gray-100 bg-white">
                                      <Card.Body className="position-relative p-0">
                                        <div className="action-buttons-row position-absolute w-100 d-flex align-items-center justify-content-end p-2">
                                          <a href={file.file_path} download className='btn-icon circle-btn btn btn-light btn-sm'><i className='icon-download'></i></a>
                                        </div>
                                        <Ratio aspectRatio="4x3">
                                          <>
                                            {file_ext === 'svg' &&
                                              <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                <Card.Img variant="top" src={AttaSvgImg} alt="Attachments" title={file.file_title} />
                                              </OverlayTrigger>
                                            }
                                            {file_ext === 'zip' &&
                                              <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                <Card.Img variant="top" src={AttaZipImg} alt="Attachments" title={file.file_title} />
                                              </OverlayTrigger>
                                            }
                                            {file_ext === 'pdf' &&
                                              <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                <Card.Img variant="top" src={AttaPdfImg} alt="Attachments" title={file.file_title} />
                                              </OverlayTrigger>
                                            }
                                            {file_ext === 'doc' || file_ext === 'docx' ?
                                              <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                <Card.Img variant="top" src={AttaDocImg} alt="Attachments" title={file.file_title} />
                                              </OverlayTrigger>
                                              : ''}
                                            {file_ext === 'xlsx' || file_ext === 'xlsm' || file_ext === 'xlsb' || file_ext === 'xltx' || file_ext === 'xltm' || file_ext === 'xls' || file_ext === 'xlt' || file_ext === 'csv' ?
                                              <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                <Card.Img variant="top" src={AttaExcelImg} alt="Attachments" title={file.file_title} />
                                              </OverlayTrigger>
                                              : ''}
                                            {file_ext !== 'svg' && file_ext !== 'zip' && file_ext !== 'pdf' && file_ext !== 'doc' && file_ext !== 'docx' && file_ext !== 'xlsx' && file_ext !== 'xlsm' && file_ext !== 'xlsb' && file_ext !== 'xltx' && file_ext !== 'xltm' && file_ext !== 'xls' && file_ext !== 'xlt' && file_ext !== 'csv' &&

                                              <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>

                                                <Card.Img variant="top" className='cursor-pointer' src={file.file_path} onClick={() => openImageViewer(taskData?.attachments, file.file_path)} alt="Attachments" title={file.file_title} />
                                              </OverlayTrigger>
                                            }
                                          </>
                                        </Ratio>
                                      </Card.Body>
                                    </Card>
                                  </div>
                                </div>
                              })}
                            </div>
                          </div> : ''
                        }
                                                                            
                        {check(['tasks.create'], userData?.role.getPermissions) && (taskData?.settings?.view_task_checklist_items === 1 || userData?.role_code !== databaseRoleCode.clientCode) &&
                          <TaskChecklistItems userData={userData} checkList={checkList} setCheckList={setCheckList} addCheckListItemProcess={addCheckListItemProcess} setAddCheckListItemProcess={setAddCheckListItemProcess} fetchCheckList={fetchCheckList} taskId={taskId} />
                        }
                        {userData?.role_code !== databaseRoleCode.clientCode || taskData?.settings?.comment_on_tasks === 1 ?
                          <AddTaskCommentForm initialContent={generatedContent} userData={userData} setFormErrors={setFormErrors} formErrors={formErrors} clearControl={clearControl} task_type={task_type} checkPermissionForLoggedDevHours={checkPermissionForLoggedDevHours} taskData={taskData} loggedDevHours={loggedDevHours} setLoggedDevHours={setLoggedDevHours} checkPermissionForLoggedBucketHours={checkPermissionForLoggedBucketHours} loggedBucketHours={loggedBucketHours} setLoggedBucketHours={setLoggedBucketHours} commentHours={commentHours} setCommentHours={setCommentHours} commentVisibleToClient={commentVisibleToClient} taskId={taskId} attachmentsFile1={attachmentsFile1} setAttachmentsFile1={setAttachmentsFile1} setReloadTaskTotalWorkingHours={setReloadTaskTotalWorkingHours} reloadTaskTotalWorkingHours={reloadTaskTotalWorkingHours} setRefreshComment={setRefreshComment} refreshComment={refreshComment} setHideCommentForm={setHideCommentForm} hideCommentForm={hideCommentForm} setCommentVisibleToClient={setCommentVisibleToClient} checkPermissionForBillableHours={checkPermissionForBillableHours} handleAttachmentClick={handleAttachmentClick} setPage={setPage} />
                          : ''}
                        {
                          taskComment?.length > 0 &&
                          <>
                            {userData?.role_code !== databaseRoleCode.clientCode || taskData?.settings?.view_task_comments === 1 ?
                              <div className="comment-area mt-12">
                                {taskComment.length > 0 && taskComment?.map((comment, index) => (
                                  <div key={index} id={`comment_${comment.id}`}>
                                    {comment?.content !== "[task_attachment]" || comment?.attachments.length > 0 ?
                                      <div className="comment-list mb-3 p-6 pb-1">
                                        {/* {userData?.role_code !== databaseRoleCode.clientCode || taskData?.settings?.hide_tasks_on_main_tasks_table === 1 || userData?.id === comment.contact_id ? */}
                                        <div key={index}>
                                          <TaskComment comment={comment} handleAttachmentClick={handleAttachmentClick} userData={userData} handleDeleteTaskComment={handleDeleteTaskComment} setRefreshComment={setRefreshComment} refreshComment={refreshComment} openImageViewer={openImageViewer} handleDeleteTaskCommentAttachment={handleDeleteTaskCommentAttachment} handleDownloadAttachmentsZip={handleDownloadAttachmentsZip} setReloadTaskTotalWorkingHours={setReloadTaskTotalWorkingHours} reloadTaskTotalWorkingHours={reloadTaskTotalWorkingHours} taskData={taskData} checkPermissionForLoggedDevHours={checkPermissionForLoggedDevHours} checkPermissionForLoggedBucketHours={checkPermissionForLoggedBucketHours} task_type={task_type} taskComment={taskComment} setTaskComment={setTaskComment} />
                                        </div>
                                        {/* : ''
                                    } */}
                                      </div>
                                      : ''}
                                  </div>
                                ))}
                              </div>
                              : ''
                            }
                          </>
                        }
                        {taskCommentProcess &&
                          <div className="data-loader">
                            <div className="data-loading data-loading-0"></div>
                            <div className="data-loading data-loading-1"></div>
                            <div className="data-loading data-loading-2"></div>
                          </div>
                        }

                      </SimpleBar>
                    </div>
                    <div className="right-content p-6 order-xl-2 order-1">
                      <SimpleBar className="right-content-inner" id='right-content-inner'>
                        <div className="task-content">
                          <h3 className="d-xl-none mb-5">{taskData?.name}</h3>
                          <h4 className="mb-4">Task Info
                            {taskData?.recurring === 1 &&
                              <Badge bg="info" className="font-weight-semibold font-12 p-2 ms-2">Recurring Task</Badge>
                            }
                          </h4>
                          <div className="task-content-list d-lg-flex align-items-center">
                            <div className="task-label-left">
                              <span className="font-12 dark-1 font-weight-semibold align-top">Created By:</span>
                            </div>
                            <div className="task-label-right ms-lg-2">
                              {taskData?.is_added_from_contact !== 1 && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode && !agencyMode ?
                                <Link to={`/user-detail/${taskData.addedfrom}`} className="dark-2 font-weight-regular font-12">{taskData?.created_by}</Link>
                                :
                                <span className="dark-2">{taskData?.created_by}</span>
                              }
                            </div>
                          </div>
                          <div className="task-content-list d-lg-flex align-items-center">
                            <div className="task-label-left">
                              <span className="font-12 dark-1 align-top font-weight-semibold">Created Date:</span>
                            </div>
                          {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode && !agencyMode ?
                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`created-date-view-task`}> {moment(taskData?.dateadded).format(display_date_format_with_time)} (EST)</Tooltip>}>
                              <div className="task-label-right ms-lg-2">
                                <Dropdown className="project-drop-down category-dropdown ">
                                  <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-weight-regular font-12" id="created_date">
                                    {moment.tz(taskData?.dateadded, 'America/New_York').tz(moment.tz.guess()).format(display_date_format_with_time)}
                                  </Dropdown.Toggle>
                                </Dropdown>
                              </div>
                            </OverlayTrigger>
                            :
                            <div className="task-label-right ms-lg-2">
                              <Dropdown className="project-drop-down category-dropdown ">
                                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-weight-regular font-12" id="created_date">
                                  {moment.tz(taskData?.dateadded, 'America/New_York').tz(moment.tz.guess()).format(display_date_format_with_time)}
                                </Dropdown.Toggle>
                              </Dropdown>
                            </div>
                          }
                          </div>
                          <div className="task-content-list d-lg-flex align-items-center">
                            <div className="task-label-left mb-lg-0">
                              <span className="font-12 dark-1"><span className='font-weight-semibold'>Start Date:</span></span>
                            </div>
                            <div className="task-label-right ms-lg-2">
                              <span className="font-12 dark-1">{moment(taskData?.startdate).format(display_date_format)}</span>
                            </div>
                          </div>
                          <div className="task-content-list d-lg-flex align-items-center">
                            <div className="task-label-left mb-lg-0">
                              <span className="font-12 dark-1"><span className='font-weight-semibold'>Due Date:</span></span>
                            </div>
                            <div className="task-label-right ms-lg-2">
                              <span className="font-12 dark-1">{taskData.duedate !== null && moment(taskData?.duedate).format(display_date_format)}</span>
                            </div>
                          </div>
                          <div className="task-content-list d-lg-flex align-items-center">
                            <div className="task-label-left">
                              <span className="font-12 dark-1 font-weight-semibold align-top lh-lg">Status:</span>
                            </div>
                            <div className="task-label-right ms-lg-2">
                              {check(['tasks.update'], userData?.role.getPermissions) && (userData?.role_code !== databaseRoleCode.clientCode || taskData?.settings?.edit_tasks === 1) ?
                                <DropdownButton
                                as="a"
                                id="dropdown-variants-status-1"
                                variant={taskStatus?.backgroundColor}
                                title={taskStatus?.status}
                                size='sm'
                                className='p-0 sidebar-status-dropdown'
                              >
                                {taskStatusList
                                  .filter(status => status.label !== taskStatus?.status)
                                  .map((status, index) => (
                                    <Dropdown.Item
                                      key={index}
                                      onClick={() => {
                                        if (status.label === "Published") {
                                          setTaskToPublish(taskData?.id);
                                          setShowPublishModal(true);
                                        } else {
                                          updateTaskStatus(taskData?.id, status.id);
                                        }
                                      }}
                                 >
                                      {`Mark as ${status.label}`}
                                    </Dropdown.Item>
                                  ))}
                                  {showApproveOption && (
                                  <Dropdown.Item
                                    onClick={() => {
                                      handleActionChange(taskData?.id, 1); // Custom action for "Approved"
                                    }}
                                  >
                                    Mark as Approved
                                  </Dropdown.Item>
                                )}
                            </DropdownButton>
                                :
                                <Dropdown className="project-drop-down category-dropdown">
                                  <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-weight-normal font-12" id="status">
                                    {taskData?.task_status_name}
                                  </Dropdown.Toggle>
                                </Dropdown>
                              }
                            </div>
                          </div>
                          {taskData.priority &&
                            <div className="task-content-list d-lg-block align-items-center">
                              <div className="task-label-left mb-lg-0">
                                <span className="font-12 dark-1">Priority Order: {taskData.priority}</span>
                              </div>
                            </div>
                          }
                          
                          {taskData?.status === 5 && taskData?.datefinished &&
                            <div className="task-content-list d-lg-flex align-items-center">
                              <div className="task-label-left">
                                <span className="font-12 dark-1 align-top font-weight-semibold">Completed Date:</span>
                              </div>
                              <div className="task-label-right ms-lg-2">
                                <Dropdown className="project-drop-down category-dropdown ">
                                  <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-weight-regular font-12" id="created_date">
                                    {moment(taskData?.datefinished).format(display_date_format)}
                                  </Dropdown.Toggle>
                                </Dropdown>
                              </div>
                            </div>
                          }
                          <hr />
                          {taskData?.agency_name &&
                            <div className="task-content-list d-lg-flex align-items-center">
                              <div className="task-label-left">
                                <span className="font-12 dark-1 align-top font-weight-semibold">Agency Name:</span>
                              </div>
                              <div className="task-label-right ms-lg-2">
                                <Dropdown className="project-drop-down category-dropdown ">
                                  <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-weight-regular font-12" id="agency_name">
                                    {taskData?.agency_name}
                                  </Dropdown.Toggle>
                                </Dropdown>
                              </div>
                            </div>
                          }

                          <div className="task-content-list d-lg-flex">
                            <div className="task-label-left mb-lg-0">
                              <span className="font-12 dark-1 align-top font-weight-semibold">Project:</span>
                            </div>
                            <div className="task-label-right ms-lg-2">
                              <Dropdown className="project-drop-down category-dropdown">
                                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-weight-normal font-12" id="projects">
                                  {check(['projects.view'], userData?.role.getPermissions) ?
                                    <Link to={`/project-detail/${taskData?.project_id}`} className="dark-2">{taskData?.project_name}</Link>
                                    :
                                    taskData?.project_name
                                  }
                                </Dropdown.Toggle>
                              </Dropdown>
                            </div>
                          </div>
                          <div className="task-content-list d-lg-flex align-items-center">
                          <div className="task-label-left mb-lg-0">
                            <span className="font-12 dark-1"><span className='font-weight-semibold'>Keyword:</span></span>
                          </div>
                          <div className="task-label-right ms-lg-2">
                            <span className="font-12 dark-1">{taskData?.keywords || 'No keyword selected'}</span>
                          </div>
                        </div>
                        {fromArticlePage && (
                          <div className="task-content-list d-lg-flex align-items-center">
                          <div className="task-label-left mb-lg-0">
                            <span className="font-12 dark-1"><span className='font-weight-semibold'>Avg Word Count:</span></span>
                          </div>
                          <div className="task-label-right ms-lg-2">
                            <span className="font-12 dark-1">{taskData?.avg_word_count || 'No wordcount'}</span>
                          </div>
                        </div>)}
                          {!agencyMode && userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.agencyMemberCode &&
                            <div className="task-content-list d-lg-flex align-items-center">
                              <div className="task-label-left mb-lg-0">
                                <span className="font-12 dark-1"><span className='font-weight-semibold'>Total Billable Hours:</span></span>
                              </div>
                              <div className="task-label-right ms-lg-2">
                                <span className="font-12 dark-1">{taskTotalWorkingHours?.comment_total_billable_hours ? taskTotalWorkingHours?.comment_total_billable_hours : '00:00'}</span>
                              </div>
                            </div>
                          }
                          {task_type === 0 &&
                            <>
                              {(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.role_code === databaseRoleCode.pcCode) && taskTotalWorkingHours?.comment_total_dev_logged_hours && taskTotalWorkingHours?.comment_total_dev_logged_hours !== '00:00' && !agencyMode ?
                                <div className="task-content-list d-lg-flex align-items-center">
                                  <div className="task-label-left mb-lg-0">
                                    <span className="font-12 dark-1"><span className='font-weight-semibold'>Total Logged Dev Plan Hours:</span></span>
                                  </div>
                                  <div className="task-label-right ms-lg-2">
                                    <span className="font-12 dark-1">{taskTotalWorkingHours?.comment_total_dev_logged_hours ? taskTotalWorkingHours?.comment_total_dev_logged_hours : '00:00'}</span>
                                  </div>
                                </div>
                                : ''}
                              {(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.role_code === databaseRoleCode.pcCode) && taskTotalWorkingHours?.comment_total_bucket_logged_hours && taskTotalWorkingHours?.comment_total_bucket_logged_hours !== '00:00' && !agencyMode ?
                                <div className="task-content-list d-lg-flex align-items-center">
                                  <div className="task-label-left mb-lg-0">
                                    <span className="font-12 dark-1"><span className='font-weight-semibold'>Total Logged Bucket Plan Hours:</span></span>
                                  </div>
                                  <div className="task-label-right ms-lg-2">
                                    <span className="font-12 dark-1">{taskTotalWorkingHours?.comment_total_bucket_logged_hours ? taskTotalWorkingHours?.comment_total_bucket_logged_hours : '00:00'}</span>
                                  </div>
                                </div>
                                : ''}

                              {(agencyMode && taskData?.current_plan.includes('dev-personalized-addon')) || ((userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode) && userData?.current_plan.includes('dev-personalized-addon')) ?
                                <div className="task-content-list d-lg-flex align-items-center">
                                  <div className="task-label-left mb-lg-0">
                                    <span className="font-12 dark-1"><span className='font-weight-semibold'>Total Dev Logged Hours:</span></span>
                                  </div>
                                  <div className="task-label-right ms-lg-2">
                                    <span className="font-12 dark-1">{taskTotalWorkingHours?.comment_total_dev_logged_hours ? taskTotalWorkingHours?.comment_total_dev_logged_hours : '00:00'}</span>
                                  </div>
                                </div>
                                : ''
                              }
                              {(agencyMode && taskData?.current_plan.includes('bucket')) || ((userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode) && userData?.current_plan.includes('bucket')) ?
                                <div className="task-content-list d-lg-flex align-items-center">
                                  <div className="task-label-left mb-lg-0">
                                    <span className="font-12 dark-1"><span className='font-weight-semibold'>Total Logged Hours:</span></span>
                                  </div>
                                  <div className="task-label-right ms-lg-2">
                                    <span className="font-12 dark-1">{taskTotalWorkingHours?.comment_total_bucket_logged_hours ? taskTotalWorkingHours?.comment_total_bucket_logged_hours : '00:00'}</span>
                                  </div>
                                </div>
                                : ''
                              }
                            </>
                          }

                          <hr className='my-6' />
                          {!agencyMode && taskData?.assign_you_by && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyMemberCode &&
                            <div className="task-content-list d-lg-block align-items-center">
                              <div className="task-label-left mb-lg-0">
                                <span className="font-12 dark-1">This task is assigned to you by <Link to={`/user-detail/${taskData?.assign_you_by_id}`}>{taskData?.assign_you_by}</Link></span>
                              </div>
                            </div>
                          }
                          {userData?.role_code !== databaseRoleCode.clientCode &&
                            <>
                              <div className="task-content-list d-lg-block align-items-center">
                                <div className="task-label-left mb-lg-2">
                                  <span className="font-12 dark-1 font-weight-semibold">
                                    Assigned To
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-hours`}>{ASSIGNEDTO_MSG}</Tooltip>}>
                                      <i className="fa-solid fa-circle-info ms-1"></i>
                                    </OverlayTrigger> :
                                  </span>
                                </div>
                                <div className="task-label-right">
                                  <UpdateAssignMember selectedAssignedBy={selectedAssignedBy} setSelectedAssignedBy={setSelectedAssignedBy} staffList={staffList} staffListForFilter={staffListForFilter} setStaffListForFilter={setStaffListForFilter} taskId={taskId} userData={userData} settings={taskData?.settings} setUpdateAssignCount={setUpdateAssignCount} />
                                </div>
                              </div>
                              <hr />
                              <div className="task-content-list d-lg-block align-items-center">
                                <div className="task-label-left mb-lg-2">
                                  <span className="font-12 dark-1 font-weight-semibold">Followers:</span>
                                </div>
                                <div className="task-label-right">
                                  <UpdateFollowers selectedFollower={selectedFollower} setSelectedFollower={setSelectedFollower} followerList={followerList} followerListForFilter={followerListForFilter} setFollowerListForFilter={setFollowerListForFilter} taskId={taskId} userData={userData} settings={taskData?.settings} />
                                </div>
                              </div>
                              {!agencyMode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode && userData.role_code !== databaseRoleCode.clientCode && taskData?.project_description && taskData?.project_description !== '' &&
        <>
          <hr className='my-4' />
          <div className="task-label-left mb-lg-2">
  <div className="row">
    <div className="col">
      <div className="rounded-10 btn btn-xs btn-primary p-4" onClick={handleShowProjectInfo}>
        Business Details
      </div>
    </div>
    <div className="col">
    <div className="rounded-10 btn btn-xs btn-secondary p-4" onClick={handleShowOutline}>
                  Outline
      </div>
    </div>
  </div>
</div>

        </>
      }
            <Modal show={showProjectInfoModal} onHide={handleCloseProjectInfo} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Business Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(taskData?.project_description && taskData?.project_description !== undefined && taskData?.project_description !== "undefined" ? taskData?.project_description : '<p class="text-muted">No description for this project</p>')).replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary btn-sm" onClick={handleCloseProjectInfo}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showOutlineModal} onHide={handleCloseOutline} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Outline</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {taskData?.generated_outline ? (
            <div dangerouslySetInnerHTML={{ __html: formatOutlineContent(taskData.generated_outline) }} />
          ) : (
            <div>No outline data</div>
        )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary btn-sm" onClick={handleCloseOutline}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
                          {/* <hr className='my-6' />
                          {userData.role_code !== databaseRoleCode.clientCode &&
                            <div className="task-content-list d-lg-block align-items-center">
                              <div className="1task-label-left mb-lg-0">
                                {favoriteTask === 0 ?
                                  <span className='add-favorite' onClick={() => handleAddRemoveFavorite(0)}><i className="icon-tag"></i> Add Favourite</span>
                                  :
                                  <span className='add-favorite' onClick={() => handleAddRemoveFavorite(1)}><i className="icon-tag"></i> Remove Favourite</span>
                                }
                              </div>
                            </div>
                          } */}
                            </>
                          }
                        </div>
                      </SimpleBar>
                    </div>
                  </div>

                </Offcanvas.Body>
              </>
              :
              <>
                <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                  <div className="d-flex align-items-center"><h2 className='mb-0'>Access Denied</h2></div>
                  <ul className="ovrlay-header-icons">
                    <li>
                      <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewTaskModal}>
                        <i className="icon-cancel"></i>
                      </button>
                    </li>
                  </ul>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                  <SimpleBar className="offcanvas-inner" id='offcanvas-inner'>
                    <TaskAccessDenied />
                  </SimpleBar>
                </Offcanvas.Body>
              </>
            }
          </Offcanvas>
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
      }
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(ViewTaskModal)
