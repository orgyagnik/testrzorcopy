import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Sidebar from "../../modules/main/Sidebar";
import Header from "../../modules/main/Header";
import Footer from "../../modules/main/Footer";
import {
  Form,
  Button,
  Spinner,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Col,
  Row,
  Card,
} from "react-bootstrap";
import APIService from "../../api/APIService";
import { formDataToObject, KeywordDifficultyToText, validateForm } from "../../utils/validator.js";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { ProjectValidator } from "../../modules/validation/ProjectValidator";
// import Select from 'react-select';
import Select from "react-select";

import AvatarImg from "../../assets/img/placeholder-image.png";
import SimpleBar from "simplebar-react";
import { filterDropdownOptionByName } from "../../utils/functions.js";
import SearchIcon from "../../assets/img/icons/serach.svg";
import { connect } from "react-redux";
import AdddashedIcon from "../../assets/img/icons/add-dashed.svg";
import { databaseRoleCode, tinymceInit } from "../../settings";
// import { Editor } from "@tinymce/tinymce-react";
// import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from 'axios';
import localeCodes from 'locale-codes';
import ISO6391 from 'iso-639-1';
import debounce from "lodash.debounce";
import { Country, State, City }  from 'country-state-city';
import { FixedSizeList as List } from "react-window";

const REACT_PYTHON_SERVER = process.env.REACT_APP_API_PYTHON_URL;

function AddProject({ userData, name }) {
  let history = useHistory();
  let nameInput = useRef();
  let websiteUrlInput = useRef();
  const audienceInput = useRef(null);
  const [process, setProcess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedAssignedBy, setSelectedAssignedBy] = useState([]);
  const [staffListForFilter, setStaffListForFilter] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const { Buffer } = require('buffer');

  const defaultPermission = [
    {
      view_tasks: 0,
      create_tasks: 0,
      edit_tasks: 0,
      comment_on_tasks: 0,
      view_task_comments: 0,
      hide_tasks_on_main_tasks_table: 0,
      view_task_attachments: 0,
      view_task_checklist_items: 0,
      upload_on_tasks: 0,
    },
  ];
  const [assignToSearch, setAssignToSearch] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  const [competitorInput, setCompetitorInput] = useState("");
  const [competitorItems, setCompetitorItems] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordItems, setKeywordItems] = useState([]);
  const [companyDetails, setCompanyDetails] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [storedLanguage, setStoredLanguage] = useState(null);
  const [storedLocation, setStoredLocation] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [targetAudience, setTargetAudience] = useState("");
    // Prepare options for react-select
    const languageOptions = localeCodes.all.map((locale) => {
      const languageName = locale.iso6391 ? ISO6391.getName(locale.iso6391) : locale.name;
      const regionName = locale.location || '';
      return {
        value: locale.tag,
        label: `${languageName}${regionName ? ` (${regionName})` : ''}`,
      };
    });

  // Prepare location options using allCountries
 const continentMapping = {
    africa: ["DZ", "EG", "NG", "ZA", "KE", "GH", "ET", "TZ", "MA", "CI"],
    asia: ["IN", "CN", "JP", "KR", "ID", "PK", "BD", "VN", "TH", "PH"],
    europe: ["FR", "DE", "IT", "ES", "UK", "NL", "PL", "SE", "BE", "RU"],
    "north-america": ["US", "CA", "MX"],
    "south-america": ["BR", "AR", "CO", "PE", "VE", "CL", "EC"],
    oceania: ["AU", "NZ", "PG", "FJ", "SB"],
  };
  
  const locationOptions = useMemo(() => {
    const countries = Country.getAllCountries();
    return [
      { value: "global", label: "🌍 Global" },
      ...Object.keys(continentMapping).flatMap((continent) => [
        { value: continent, label: `🌎 ${continent.replace("-", " ").toUpperCase()}` },
        ...countries
          .filter(({ isoCode }) => continentMapping[continent]?.includes(isoCode))
          .flatMap(({ name, isoCode }) => {
            const states = State.getStatesOfCountry(isoCode);
            return [
              { value: isoCode.toLowerCase(), label: `${name}` },
              ...states.flatMap(({ countryCode, isoCode, name }) => {
                const cities = City.getCitiesOfState(countryCode, isoCode);
                return [
                  {
                    value: `${countryCode.toLowerCase()}-${name.toLowerCase()}`,
                    label: `➡ ${name}`,
                  },
                  ...cities.map(({ name }) => ({
                    value: `${countryCode.toLowerCase()}-${isoCode.toLowerCase()}-${name.toLowerCase()}`,
                    label: `➡ ➡ ${name}`,
                  })),
                ];
              }),
            ];
          }),
      ]),
    ];
  }, []); // Ensure no unnecessary re-renders
  

 // Function to filter options based on input value
 const filterOptions = (inputValue) => {
  if (!inputValue) return locationOptions; // Show all available locations

  return locationOptions.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );
};



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/project');
        const data = await response.json();
        setStoredLanguage(data.language);
        setStoredLocation(data.location);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once
useEffect(() => {
    if (storedLanguage && !selectedLanguage) {
      const initialSelectedLanguage = languageOptions.find(option => option.value === storedLanguage);
      setSelectedLanguage(initialSelectedLanguage);
    }
    if (storedLocation && selectedLocation.length === 0) { // Check if selectedLocation is empty
      const initialSelectedLocations = locationOptions.filter(option => storedLocation.includes(option.value));
      setSelectedLocation(initialSelectedLocations);
    }
  }, [storedLanguage, storedLocation, languageOptions, locationOptions, selectedLanguage, selectedLocation]);
// Custom styles for react-select
const customStyless = {
  control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#80bdff' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
      '&:hover': {
          borderColor: '#80bdff',
      },
      height: '3.3rem',
      borderRadius: '.25rem',
      fontSize: '1rem',
      width: '100%',
  }),
  menu: (provided) => ({
      ...provided,
      zIndex: 9999,
  }),
  placeholder: (provided) => ({
      ...provided,
      color: '#6c757d',
  }),
  singleValue: (provided) => ({
      ...provided,
      color: '#495057',
  }),
};

// Adjusted custom styles for react-select to handle multiple selections
const customStylesForMultiSelect = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#80bdff' : '#ced4da',
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
    '&:hover': {
      borderColor: '#80bdff',
    },
    // Removed fixed height to allow for dynamic resizing
    minHeight: '3.3rem', // Minimum height to match single selection style
    borderRadius: '.25rem',
    fontSize: '1rem',
    width: '100%',
    // Adjust padding dynamically based on whether there are values selected
    padding: state.hasValue ? '0.4rem 0.8rem' : '0.2rem 0.8rem',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6c757d',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#495057',
  }),
  // Add styles for multiValue (tags) to ensure they fit within the control
  multiValue: (provided) => ({
    ...provided,
    borderRadius: '2px',
    backgroundColor: '#e9ecef',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#495057',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#495057',
    ':hover': {
      backgroundColor: '#dc3545',
      color: 'white',
    },
  }),
};

const handleGenerateWithAI = async () => {
  setAiLoading(true);
  try {
      const websiteUrl = websiteUrlInput.current?.value;
      if (!websiteUrl) {
          toast.error("Please enter a website URL");
          return;
      }

      // First API request to get company business summary
      const response = await axios.post(
          `${REACT_PYTHON_SERVER ? REACT_PYTHON_SERVER : "https://razorcopy-py.sitepreviews.dev"}/company-business-summary`, 
          { 
              company_name: websiteUrl // Sending the website URL
          }
      );

      if (!response.data || !response.data.company_details) {
          throw new Error("Invalid response from business summary API");
      }

      const companyDetails = response.data.company_details;

      // Second API request to fetch the target audience based on company details
      const targetAudienceResponse = await axios.post(
          `${REACT_PYTHON_SERVER ? REACT_PYTHON_SERVER : "https://razorcopy-py.sitepreviews.dev"}/target-audience`, 
          { 
              company_details: companyDetails // Sending the fetched business summary,
          }
      );

      if (!targetAudienceResponse.data || !targetAudienceResponse.data.target_audience) {
          throw new Error("Invalid response from target audience API");
      }

      const targetAudience = targetAudienceResponse.data.target_audience;
      if (audienceInput.current) {
        const existingValue = audienceInput.current.value.trim();
        audienceInput.current.value = existingValue
            ? `${existingValue}, ${targetAudience}`
            : targetAudience;
      }
      // Formatting the response
      const formattedContent = `
          <div class="company-description" style="font-family: Arial, sans-serif; line-height: 1.6;">
              ${companyDetails.split('\n\n').map(paragraph => {
                  if (paragraph.includes('**')) {
                      const title = paragraph.replace(/\*\*/g, '');
                      return `<h3 style="color: #2c3e50; margin-top: 1.8em; margin-bottom: 0.8em; font-size: 1.4em; border-bottom: 2px solid #eee; padding-bottom: 0.3em;">${title}</h3>`;
                  }
                  if (paragraph.includes('1.')) {
                      const items = paragraph.split('\n').filter(item => item.trim());
                      const listItems = items.slice(1).map(item => {
                          const cleanItem = item.replace(/^\d+\.\s+\*\*([^*]+)\*\*:/, '<strong style="color: #34495e">$1:</strong>');
                          return `<li style="margin-bottom: 0.8em; line-height: 1.6; color: #444;">${cleanItem}</li>`;
                      }).join('');
                      return `<p style="color: #444; margin-bottom: 1em;">${items[0]}</p><ul style="margin-left: 1.5em; margin-bottom: 1.5em; list-style-type: disc;">${listItems}</ul>`;
                  }
                  return `<p style="margin-bottom: 1.2em; color: #444; text-align: justify;">${paragraph}</p>`;
              }).join('')}
              
          </div>
      `;

      setHtmlContent(formattedContent);
      setCompanyDetails(companyDetails);
      setTargetAudience(targetAudience); // Save the target audience
      toast.success("Content and target audience generated successfully!");
      
  } catch (error) {
      console.error("Error calling the API:", error);
      toast.error("Failed to generate content. Please try again.");
  } finally {
      setAiLoading(false); // Reset loading state
  }
};

  // Function to validate inputs
  const validateInputs = () => {
    let errors = { competitorInput: "", keywordInput: "" };
    if (competitorInput.trim() !== "" && !competitorItems.includes(competitorInput.trim())) {
      errors.competitorInput = "Hit enter if you want to keep this data.";
    }
    if (keywordInput.trim() !== "" && !keywordItems.includes(keywordInput.trim())) {
      errors.keywordInput = "Hit enter if you want to keep this data.";
    }
    setFormErrors(errors);
    return !errors.competitorInput && !errors.keywordInput;
  };

  // Function to handle editing competitor items
  const handleEditCompetitorItem = (index, newValue) => {
    const updatedItems = [...competitorItems];
    updatedItems[index] = newValue;
    setCompetitorItems(updatedItems);
  };

  // Function to handle editing keyword items
  const handleEditKeywordItem = (index, newValue) => {
    const updatedItems = [...keywordItems];
    updatedItems[index] = newValue;
    setKeywordItems(updatedItems);
  };

  // Function to handle adding competitor items
  const handleAddCompetitorItem = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (competitorInput.trim() !== "") {
        setCompetitorItems([...competitorItems, competitorInput.trim()]);
        setCompetitorInput("");
        setFormErrors({ ...formErrors, competitorInput: "" });
      }
    }
  };

  // Helper function to capitalize each word in a string
  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  // Function to handle adding keyword items
  const handleAddKeywordItem = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        // Capitalize the input
        const capitalizedKeyword = capitalizeWords(keywordInput.trim());

        // Validate the input
        if (capitalizedKeyword !== "" && !keywordItems.includes(capitalizedKeyword)) {
            // Add the keyword if it's valid
            setKeywordItems([...keywordItems, capitalizedKeyword]);
            setKeywordInput(""); // Clear the input
            setFormErrors({ ...formErrors, keywordInput: "" }); // Clear the error message
        } else {
            // Set the error message if the input is invalid
            setFormErrors({ ...formErrors, keywordInput: "Hit enter if you want to keep this data." });
        }
    }
  };


  // Function to handle removing competitor items
  const handleRemoveCompetitorItem = (index) => {
    setCompetitorItems(competitorItems.filter((_, i) => i !== index));
  };

  // Function to handle removing keyword items
  const handleRemoveKeywordItem = (index) => {
    setKeywordItems(keywordItems.filter((_, i) => i !== index));
  };

  // Function to handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      setProcess(true);
      try {
        await addProject(); // Ensure this function throws an error if the save fails
        // toast.success("Project saved successfully!");
      } catch (error) {
        console.error("Error saving project:", error);
        toast.error("Failed to save project. Please try again.");
      } finally {
        setProcess(false);
      }
    } else {
      toast.error("Please resolve the errors before saving.");
    }
  };


  useEffect(() => {
    APIService.getAllMembers("").then((response) => {
      if (response.data?.status) {
        setStaffList(response.data?.data);
        setStaffListForFilter(response.data?.data);
      }
    });
  }, []);

  const addProject = async () => {
    setProcess(true);
    setFormErrors([]);

    let validate = validateForm(
      ProjectValidator(nameInput.current?.value, "not required")
    );
    if (Object.keys(validate).length) {
      setFormErrors(validate);
      setProcess(false);
      return;
    }

    try {
      // Validate required inputs
      if (!websiteUrlInput.current?.value) {
        toast.error("Website URL is required");
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          websiteUrl: "Website URL is required",
        }));
        setProcess(false);
        return;
      }

      if (keywordItems.length === 0) {
        toast.error("At least one keyword is required");
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          keywordInput: "At least one keyword is required",
        }));
        setProcess(false);
        return;
      }
      
      // if (competitorInput.length === 0) {
      //   toast.error("At least one competitor is required");
      //   setProcess(false);
      //   return;
      // }

      // Generate topic titles based on the targeted keywords
      const titleResponse = await APIService.generateTitles({
        client_site_url: websiteUrlInput.current?.value,
        competitor_urls: competitorItems,
        keywords: keywordItems,
      });

      if (!titleResponse.data?.status) {
        throw new Error(
          titleResponse.data?.message || "Failed to generate topic titles"
        );
      }

      // Parse and clean the titles, removing empty entries
      const topicTitlesArray = titleResponse.data.data.titles
        .split("\n")
        .map((title) => title.trim().replace(/^\d+[\.-]\s*/, ""))
        .filter((title) => title !== ""); // Remove empty titles

      if (topicTitlesArray.length === 0) {
        throw new Error("No valid titles were generated.");
      }

      let keywordMetricsMap = {};
      try {
          const metricsResponse = await APIService.fetchKeywordMetrics({ keywords: keywordItems });
          if (metricsResponse.data?.success) {
              metricsResponse.data.data.forEach((metrics) => {
                  keywordMetricsMap[metrics.keyword] = {
                      volume: metrics.keyword_volume || 0,
                      difficulty: metrics.keyword_difficulty || 0
                  };
              });
          }
      } catch (error) {
          console.error("Keyword Metrics Fetch Error:", error.message);
      }

      // Create the project
      const params = new FormData();
      const currentProjectName = nameInput.current?.value;
      params.append("name", currentProjectName);

      // Append new fields
      if (selectedLanguage) {
        params.append("language", selectedLanguage.value);
      }
      if (selectedLocation && selectedLocation.length > 0) {
        // Assuming your backend expects a single string of locations separated by commas
        const locationValue = selectedLocation.map(location => location.value);
        params.append("location", JSON.stringify(locationValue));
      }
      params.append("targeted_audience", audienceInput.current?.value);

      let assigned_members_list = selectedAssignedBy.map((obj) => obj.staffid);
      if (!assigned_members_list.includes(userData?.id)) {
        assigned_members_list.push(userData?.id);
      }

      params.append("assign_to", JSON.stringify(assigned_members_list));
      params.append("description", htmlContent || "");

      if (competitorItems.length > 0) {
        params.append("competitors_websites", JSON.stringify(competitorItems));
      }
      
      params.append("targeted_keywords", JSON.stringify(keywordItems));
      params.append("website_url", websiteUrlInput.current?.value);
      params.append("topic_titles", topicTitlesArray);
      const sitemapResponse = await axios.post(
        `${REACT_PYTHON_SERVER ? REACT_PYTHON_SERVER : "https://razorcopy-py.sitepreviews.dev"}/sitemap`,
        { url: websiteUrlInput.current?.value }
      );
      toast.loading("Fetching Sitemap...");
      if (sitemapResponse.status === 200) {
        const formattedSitemap = sitemapResponse.data.map((page) => ({
          url: page.url,
          pageType: page.content_type || "Unknown",
          metaTitle: page.meta_title || "No Title",
          metaDescription: page.meta_description || "No Description",
        }));
        const sitemapBase64 = Buffer.from(JSON.stringify(formattedSitemap)).toString("base64");
        params.append("detailedsitemap", sitemapBase64);
        toast.dismiss();
      }

      // Save the project data
      const addProjectResponse = await APIService.addProject(formDataToObject(params));

      if (!addProjectResponse.data?.status) {
        throw new Error(
          addProjectResponse.data?.message || "Failed to create project"
        );
      }

      const projectId = addProjectResponse.data.data?.id;
      if (!projectId) {
        throw new Error(
          "Project ID is undefined. Cannot create tasks without a valid project ID."
        );
      }

      // Create tasks for each title
      const taskCreationPromises = topicTitlesArray.map(
        async (title, index) => {
          try {
            let topicTitle = title
              .trim()
              .replace(/^-\s*/, "")
              .replace(/"/g, "")
              .replace(/-/g, "")
              .trim();

            if (!topicTitle) {
              console.warn(`Skipping empty title at index ${index}`);
              return;
            }

            const taskParams = new FormData();
            taskParams.append("name", topicTitle);
            taskParams.append("project_id", projectId);
            taskParams.append("assigned_members", JSON.stringify(assigned_members_list));
            taskParams.append("description", htmlContent || "");
            taskParams.append("keywords", keywordItems[index] || "");
            taskParams.append("status", "pending");
            taskParams.append(
              "competitors_websites",
              JSON.stringify(competitorItems)
            );
            taskParams.append("website_url", websiteUrlInput.current?.value);
            const metrics = keywordMetricsMap[keywordItems[index]] || { volume: 0, difficulty: 0 };
            taskParams.append("keyword_volume", parseInt(metrics.volume));
            taskParams.append("keyword_difficulty", KeywordDifficultyToText(metrics.difficulty));

            const createTaskResponse = await APIService.addTask(formDataToObject(taskParams));
            if (!createTaskResponse.data?.status) {
              throw new Error(`Failed to create task for title: ${topicTitle}`);
            }
          } catch (taskError) {
            console.error(
              `Error creating task for title at index ${index}:`,
              taskError
            );
            throw taskError; // Re-throw to be caught by Promise.allSettled
          }
        }
      );

      // Wait for all tasks to be created
      const taskResults = await Promise.allSettled(taskCreationPromises);

      // Check if any tasks failed
      const failedTasks = taskResults.filter(
        (result) => result.status === "rejected"
      );
      if (failedTasks.length > 0) {
        console.warn(`${failedTasks.length} tasks failed to create`);
        toast.warning(
          `Project created but ${failedTasks.length} tasks failed to create`,
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
      } else {
        toast.success("Project and all tasks created successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      // Navigate to projects page after short delay
      setTimeout(() => {
        history.push("/projects");
      }, 1500);
    } catch (error) {
      console.error("Error occurred:", error);
      toast.error(
        error.message || "An error occurred while creating the project",
        {
          position: toast.POSITION.TOP_RIGHT,
        }
      );
    } finally {
      setProcess(false);
    }
  };


  const onAssignBySelect = (e) => {
    handleAssignToSearch("");
    let id = e;
      let addRemovechk =
        selectedAssignedBy.filter(function (arr) {
          return arr.staffid === id;
        }).length > 0;
      if (!addRemovechk) {
        let newstaffList = staffList.filter(function (arr) {
          return arr.staffid === id;
        });
        setSelectedAssignedBy(selectedAssignedBy.concat(newstaffList));
      } else {
        let newstaffList = selectedAssignedBy.filter(function (arr) {
          return arr.staffid !== id;
        });
        setSelectedAssignedBy(newstaffList);
      }
  };

  const handleAssignToSearch = (value) => {
    setAssignToSearch(value);
    filterDropdownOptionByName(staffList, value, setStaffListForFilter);
  };

  useEffect(() => {}, [refresh]);

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name ? name : ""} />
        <div className="inner-content">
          <Card className="rounded-10 p-6">
            <Card.Body className="p-0" id="projectBody">
              <Form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await addProject();
                }}
              >
                <Row className="g-4">
                <Col sm={12} md={4} lg={4} xl={3}>
        <Form.Group className="mb-7 w-100 validation-required" controlId="roleName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Project Name"
            ref={nameInput}
            className={`form-control ${formErrors.nameInput && "is-invalid"}`}
          />
          {formErrors.nameInput && (
            <span className="text-danger">{formErrors.nameInput}</span>
          )}
        </Form.Group>
      </Col>
                  {/* <Col sm={12} md={4} lg={4} xl={3}>
                      <Form.Group className="mb-7 w-100" controlId="roleCode">
                        <Form.Label>Customer</Form.Label>
                        <Select
                          styles={customStyles}
                          className="custom-select"
                          options={clientList}
                          onChange={handleClientSelect}
                          value={clientList.filter(function (option) {
                            return option.value === client;
                          })}
                        />
                        {formErrors.clientInput && (
                          <span className="text-danger">
                            {formErrors.clientInput}
                          </span>
                        )}
                      </Form.Group>
                    </Col> */}

                  {userData.role_code !== databaseRoleCode.clientCode &&
                    userData.role_code !==
                      databaseRoleCode.agencyMemberCode && (
                      <Col sm={12} md={6} lg={6} xl={6}>
                        <div className="task-label-left mb-3">
                          <span className="font-14 font-medium dark-1 font-weight-medium">
                            Assigned To
                          </span>
                        </div>
                        <div className="task-label-right position-relative mb-7">
                          <div className="avatar-group">
                            {selectedAssignedBy.map((assignUser, index) => (
                              <span
                                className="avatar avatar-md avatar-circle"
                                key={index}
                              >
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id={`tooltip-${index}`}>
                                      {" "}
                                      {assignUser.name}
                                    </Tooltip>
                                  }
                                >
                                  {assignUser.profile_image !== "" &&
                                  assignUser.profile_image !== null ? (
                                    <img
                                      className="avatar-img"
                                      src={`${assignUser.profile_image}`}
                                      alt={assignUser.name}
                                      onError={({ currentTarget }) => {
                                        currentTarget.onerror = null;
                                        currentTarget.src = AvatarImg;
                                      }}
                                    />
                                  ) : (
                                    <img
                                      className="avatar-img"
                                      src={AvatarImg}
                                      alt={assignUser.name}
                                    />
                                  )}
                                </OverlayTrigger>
                              </span>
                            ))}

                            <span className="avatar avatar-md avatar-circle">
                              <Dropdown
                                className="project-drop-down category-dropdown "
                                onSelect={onAssignBySelect}
                                autoClose="outside"
                              >
                                <Dropdown.Toggle
                                  as="a"
                                  bsPrefix="no-toggle"
                                  className="dark-2 font-weight-medium font-12 cursor-pointer"
                                  id="assign"
                                >
                                  <img
                                    className="avatar-img"
                                    src={AdddashedIcon}
                                    alt="Add Member"
                                  />
                                </Dropdown.Toggle>
                                <Dropdown.Menu
                                  as="ul"
                                  align="down"
                                  className="p-2 w-100"
                                >
                                  <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                    <div className="search-box w-100">
                                      <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                        <img src={SearchIcon} alt="Search" />
                                        <input
                                          type="search"
                                          className="form-control border-0"
                                          placeholder="Name"
                                          value={assignToSearch}
                                          onChange={(e) =>
                                            handleAssignToSearch(e.target.value)
                                          }
                                        />
                                      </div>
                                    </div>
                                  </Dropdown.Header>
                                  <SimpleBar className="dropdown-body">
                                    {staffListForFilter.map((drp, index) => (
                                      <Dropdown.Item
                                        as="li"
                                        key={index}
                                        eventKey={drp.staffid}
                                        className={`${
                                          selectedAssignedBy.filter(function (
                                            arr
                                          ) {
                                            return arr.staffid === drp.staffid;
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
                              </Dropdown>
                            </span>
                          </div>
                        </div>
                        {formErrors.selectedAssignedBy && (
                          <span className="text-danger">
                            {formErrors.selectedAssignedBy}
                          </span>
                        )}
                      </Col>
                    )}
                </Row>
                <Row className="g-4">
                <Col sm={12} md={4} lg={4} xl={3}>
                <Form.Group
                    className="mb-7 w-100 validation-required"
                    controlId="language"
                >
                    <Form.Label>Language</Form.Label>
                    <Select
                        options={languageOptions}
                        value={selectedLanguage}
                        onChange={setSelectedLanguage}
                        styles={customStyless}
                        placeholder="Select Language"
                        isSearchable
                        classNamePrefix="react-select"
                    />
                    {formErrors.language && (
                        <span className="text-danger">
                            {formErrors.language}
                        </span>
                    )}
                </Form.Group>
            </Col>
            <Col sm={12} md={4} lg={4} xl={3}>
                <Form.Group
                    className="mb-7 w-100 validation-required"
                    controlId="location"
                >
                    <Form.Label>Location</Form.Label>
                    <VirtualizedSelect
                        filterOptions={filterOptions}
                        options={locationOptions}
                        value={selectedLocation}
                        onChange={setSelectedLocation}
                        styles={customStylesForMultiSelect}
                        placeholder="Select Location"
                        isSearchable
                        classNamePrefix="react-select"
                      />
                    {/* <Select
                        options={locationOptions}
                        value={selectedLocation}
                        onChange={setSelectedLocation}
                        styles={customStyless}
                        placeholder="Select Location"
                        isSearchable
                        isMulti // Enable multi-select
                        classNamePrefix="react-select"
                    /> */}
                    {formErrors.location && (
                        <span className="text-danger">
                            {formErrors.location}
                        </span>
                    )}
                </Form.Group>
            </Col>
                    <Col sm={12} md={4} lg={4} xl={3}>
                        <Form.Group
                            className="mb-7 w-100 validation-required"
                            controlId="audience"
                        >
                            <Form.Label>Targeted Audience</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Targeted Audience"
                                ref={audienceInput}
                                className={`form-control ${formErrors.audience && "is-invalid"}`}
                            />
                            {formErrors.audience && (
                                <span className="text-danger">
                                    {formErrors.audience}
                                </span>
                            )}
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="g-4">
                <Col sm={12} md={4} lg={4} xl={3}>
                    <Form.Group
                      className="mb-7 w-100 validation-required"
                      controlId="websiteUrl"
                    >
                      <Form.Label>Website URL</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Website URL"
                        ref={websiteUrlInput} // Use the defined ref here
                        className={`form-control ${formErrors.websiteUrl && "is-invalid"}`}
                      />
                      {formErrors.websiteUrl && (
                        <span className="text-danger">
                          {formErrors.websiteUrl}
                        </span>
                      )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={4} lg={4} xl={3}>
                    <Form.Group className="mb-7 w-100" controlId="dynamicInput">
                      <Form.Label>Competitors Websites</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Type and hit enter"
                        value={competitorInput}
                        onChange={(e) => {
                          setCompetitorInput(e.target.value);
                          setFormErrors({ ...formErrors, competitorInput: "" });
                        }}
                        onKeyDown={handleAddCompetitorItem}
                        className={formErrors.competitorInput ? "is-invalid" : ""}
                      />
                      {formErrors.competitorInput && (
                        <span className="text-danger">{formErrors.competitorInput}</span>
                      )}
                      <div style={{ marginTop: "10px" }}>
                        {competitorItems.map((item, index) => (
                          <div key={index} style={{ position: "relative", marginBottom: "5px" }}>
                            <Form.Control
                              type="text"
                              value={item}
                              onChange={(e) => handleEditCompetitorItem(index, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Tab") {
                                  e.preventDefault();
                                }
                              }}
                              style={{ width: "100%", paddingRight: "30px", boxSizing: "border-box" }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCompetitorItem(index)}
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "red",
                                cursor: "pointer",
                                fontSize: "16px",
                                lineHeight: "1",
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={4} lg={4} xl={3}>
                    <Form.Group className="mb-7 w-100" controlId="dynamicInput">
                      <Form.Label>Targeted Keywords</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Type and hit enter"
                        value={keywordInput}
                        onChange={(e) => {
                          setKeywordInput(e.target.value);
                          setFormErrors({ ...formErrors, keywordInput: "" });
                        }}
                        onKeyDown={handleAddKeywordItem}
                        className={formErrors.keywordInput ? "is-invalid" : ""}
                      />
                      {formErrors.keywordInput && (
                        <span className="text-danger">{formErrors.keywordInput}</span>
                      )}
                      <div style={{ marginTop: "10px" }}>
                        {keywordItems.map((item, index) => (
                          <div key={index} style={{ position: "relative", marginBottom: "5px" }}>
                            <Form.Control
                              type="text"
                              value={item}
                              onChange={(e) => handleEditKeywordItem(index, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Tab") {
                                  e.preventDefault();
                                }
                              }}
                              style={{ width: "100%", paddingRight: "30px", boxSizing: "border-box" }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveKeywordItem(index)}
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "red",
                                cursor: "pointer",
                                fontSize: "16px",
                                lineHeight: "1",
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={4} lg={4} xl={3}>
                    {/* <Form.Group className="mb-7 w-100" controlId="roleName">
                                            <Form.Label>Start Date</Form.Label>
                                            <SingleDatePickerControl
                                                selected={date}
                                                onDateChange={(date) => setDate(date)}
                                                onChange={(date) => setDate(date)}
                                                minDate={(userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) ? null : new Date() }
                                                maxDate={dueDate}
                                                isClearable
                                                className={`form-control ${formErrors.date && 'is-invalid'}`}
                                            />
                                        </Form.Group> */}
                  </Col>
                  <Col sm={12} md={4} lg={4} xl={3}>
                    {/* <Form.Group className="mb-7 w-100" controlId="roleCode">
                                            <Form.Label>Due Date</Form.Label>
                                            <SingleDatePickerControl
                                                selected={dueDate}
                                                onDateChange={(date) => setDueDate(date)}
                                                onChange={(date) => setDueDate(date)}
                                                minDate={ (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) ? null : date ? date : new Date() }
                                                isClearable
                                                className={`form-control ${formErrors.dueDate && 'is-invalid'}`}
                                            />
                                        </Form.Group> */}
                  </Col>
                </Row>
                {/* // Remove the condition to allow all users to see the project
                  description */}
<Row className="g-4">
    <Col sm={12} md={12}>
        <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
                <Form.Label className="mb-0" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Business Details
                </Form.Label>
            </div>
            <Button
            variant="primary"
            size="md"
            type="button"
            onClick={handleGenerateWithAI}
            style={{
                padding: '0.2rem 0.2rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                borderRadius: '5px',
            }}
            disabled={aiLoading} // Disable button while loading
        >
            {aiLoading ? ( // Show spinner if loading
                <>
                    <Spinner
                        size="sm"
                        animation="border"
                        className="me-1"
                    />
                    Generating...
                </>
            ) : (
                <>
                    Generate with AI 
                    <span role="img" aria-label="sparkle" style={{ marginLeft: '5px' }}>
                        ✨
                    </span>
                </>
            )}
        </Button>
        </div>
        <ReactQuill
            theme="snow"
            value={htmlContent}
            onChange={setHtmlContent}
        />
    </Col>
</Row>
                <Row className="g-4">
                  <Col sm={12} md={12}>
                    {/* <Accordion alwaysOpen defaultActiveKey={[0]} className="dashboard-accordion">
                                            <Accordion.Item eventKey={0} className="">
                                                <Accordion.Header as="h4" className="pt-6">Project Settings</Accordion.Header >
                                                <Accordion.Body className="pb-9 px-0">
                                                    <Row className="g-4">
                                                        <Col sm={12} md={6} lg={4} xl={4}>
                                                            <Form.Check type="checkbox" id="allow-customer-task-view" label="Allow customer to view tasks" value="view_tasks" checked={checkSettingChecked("view_tasks")} onChange={handleProjectPermissionChange} />
                                                        </Col>
                                                        <Col sm={12} md={6} lg={4} xl={4}>
                                                            <Form.Check type="checkbox" id="allow-customer-task-create" label="Allow customer to create tasks" value="create_tasks" checked={checkSettingChecked("create_tasks")} onChange={handleProjectPermissionChange} disabled={!checkSettingChecked("view_tasks")} />
                                                        </Col>
                                                        <Col sm={12} md={6} lg={4} xl={4}>
                                                            <Form.Check type="checkbox" id="allow-customer-task-edit" label="Allow customer to edit tasks (only tasks created from contact)" value="edit_tasks" checked={checkSettingChecked("edit_tasks")} onChange={handleProjectPermissionChange} disabled={!checkSettingChecked("view_tasks")} />
                                                        </Col>
                                                        <Col sm={12} md={6} lg={4} xl={4}>
                                                            <Form.Check type="checkbox" id="allow-customer-task-comment" label="Allow customer to comment on project tasks" value="comment_on_tasks" checked={checkSettingChecked("comment_on_tasks")} onChange={handleProjectPermissionChange} disabled={!checkSettingChecked("view_tasks")} />
                                                        </Col>
                                                        <Col sm={12} md={6} lg={4} xl={4}>
                                                            <Form.Check type="checkbox" id="allow-customer-task-view-comment" label="Allow customer to view task comments" value="view_task_comments" checked={checkSettingChecked("view_task_comments")} onChange={handleProjectPermissionChange} disabled={!checkSettingChecked("view_tasks")} />
                                                        </Col>
                                                        <Col sm={12} md={6} lg={4} xl={4}>
                                                            <Form.Check type="checkbox" id="allow-customer-task-view-comment-uwp" label="Allow customer to view task comments from UnlimitedWP" value="hide_tasks_on_main_tasks_table" checked={checkSettingChecked("hide_tasks_on_main_tasks_table")} onChange={handleProjectPermissionChange} disabled={!checkSettingChecked("view_tasks")} />
                                                        </Col>
                                                        <Col sm={12} md={6} lg={4} xl={4}>
                                                            <Form.Check type="checkbox" id="allow-customer-task-view-attachment" label="Allow customer to view task attachments" value="view_task_attachments" checked={checkSettingChecked("view_task_attachments")} onChange={handleProjectPermissionChange} disabled={!checkSettingChecked("view_tasks")} />
                                                        </Col>
                                                        <Col sm={12} md={6} lg={4} xl={4}>
                                                            <Form.Check type="checkbox" id="allow-customer-task-view-checklist" label="Allow customer to view task checklist items" value="view_task_checklist_items" checked={checkSettingChecked("view_task_checklist_items")} onChange={handleProjectPermissionChange} disabled={!checkSettingChecked("view_tasks")} />
                                                        </Col>
                                                        <Col sm={12} md={6} lg={4} xl={4}>
                                                            <Form.Check type="checkbox" id="allow-customer-task-upload-attachment" label="Allow customer to upload attachments on tasks" value="upload_on_tasks" checked={checkSettingChecked("upload_on_tasks")} onChange={handleProjectPermissionChange} disabled={!checkSettingChecked("view_tasks")} />
                                                        </Col>
                                                    </Row>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion> */}
                  </Col>
                </Row>
                <div className="mt-5">
                  <Button
                    disabled={process}
                    className="me-2"
                    variant="soft-secondary"
                    size="md"
                    type="button"
                    onClick={() => {
                      history.push("/projects");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={process}
                    variant="primary"
                    size="md"
                    type="submit"  // Changed from "button" to "submit"
                    onClick={handleFormSubmit}
                  >
                    {!process && "Save"}
                    {process && (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status" 
                          aria-hidden="true" 
                          className="me-1"
                        />
                        Saving...  
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
        <Footer />
      </div>
    </>
  );
}

const MenuList = ({ children, options, selectProps, maxHeight }) => {
  const { inputValue, setLoadMore } = selectProps; // Capture load more function
  const itemSize = 35;
  const listHeight = Math.min(options.length * itemSize, maxHeight || 300);

  return (
    <List
      height={listHeight}
      itemCount={options.length}
      itemSize={itemSize}
      width="100%"
      onScroll={({ scrollOffset }) => {
        if (scrollOffset + listHeight >= options.length * itemSize - 100) {
          setLoadMore(true); // Trigger load more when near the bottom
        }
      }}
    >
      {({ index, style }) => (
        <div style={style}>{children[index]}</div>
      )}
    </List>
  );
};



// Main Virtualized Select Component
const VirtualizedSelect = ({ options, filterOptions, value = [], onChange, ...props }) => {
  const [inputValue, setInputValue] = useState("");
  const [displayOptions, setDisplayOptions] = useState(options.slice(0, 50)); // Initial 50 options
  const [loadMore, setLoadMore] = useState(false);

  // Debounced Search
  const debouncedFilter = useCallback(debounce((val) => {
    const filtered = filterOptions(val);
    setDisplayOptions(filtered.slice(0, 50)); // Reset with new search results
  }, 300), [options]);

  // Load more items on scroll
  useMemo(() => {
    if (loadMore) {
      setTimeout(() => {
        setDisplayOptions((prev) => [...prev, ...options.slice(prev.length, prev.length + 50)]);
        setLoadMore(false);
      }, 300); // Small delay to prevent overloading
    }
  }, [loadMore, options]);

  return (
    <Select
      {...props}
      options={displayOptions} // Dynamically updated
      value={value || []}
      onChange={onChange}
      onInputChange={debouncedFilter}
      menuPortalTarget={document.body}
      isMulti
      isSearchable
      components={{ MenuList }}
      setLoadMore={setLoadMore} // Pass down load more trigger
    />
  );
};



const mapStateToProps = (state) => ({
  userData: state.Auth.user,
});

export default connect(mapStateToProps)(AddProject);
