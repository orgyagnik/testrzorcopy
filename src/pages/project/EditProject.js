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
import { formDataToObject, validateForm } from "../../utils/validator.js";
import { toast } from "react-toastify";
import { useHistory, useParams } from "react-router-dom";
import { ProjectValidator } from "../../modules/validation/ProjectValidator";
// import Select from 'react-select';
import AvatarImg from "../../assets/img/placeholder-image.png";
import SimpleBar from "simplebar-react";
import { filterDropdownOptionByName } from "../../utils/functions.js";
import SearchIcon from "../../assets/img/icons/serach.svg";
import { connect } from "react-redux";
import AdddashedIcon from "../../assets/img/icons/add-dashed.svg";
import { databaseRoleCode } from "../../settings";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from 'axios';
import ISO6391 from 'iso-639-1';
import Select from 'react-select';
import localeCodes from 'locale-codes';
import debounce from "lodash.debounce";
import { Country, State, City }  from 'country-state-city';
import { FixedSizeList as List } from "react-window";

const REACT_PYTHON_SERVER = process.env.REACT_APP_API_PYTHON_URL;

function EditProject({ userData, name }) {
  let { id } = useParams();
  let history = useHistory();
  let nameInput = useRef();
  const [process, setProcess] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [selectedAssignedBy, setSelectedAssignedBy] = useState([]);
  const [staffListForFilter, setStaffListForFilter] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [refresh, setRefresh] = useState(false);
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
  const [projectPermission, setProjectPermission] = useState(defaultPermission);
  const [assignToSearch, setAssignToSearch] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");
  const [competitorItems, setCompetitorItems] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordItems, setKeywordItems] = useState([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [TargetedAudience, setTargetedAudience] = useState("");
  const [description, setDescription] = useState(""); // For project description
  const [aiLoading, setAiLoading] = useState(false);
  const [storedLanguage, setStoredLanguage] = useState(null);
  const [storedLocation, setStoredLocation] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Prepare options for react-select
  const languageOptions = localeCodes.all.map((locale) => {
    const languageName = locale.iso6391 ? ISO6391.getName(locale.iso6391) : locale.name;
    const regionName = locale.location || '';
    return {
      value: locale.tag,
      label: `${languageName}${regionName ? ` (${regionName})` : ''}`,
    };
  });

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
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/project'); // Replace with your actual API endpoint
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
    if (storedLocation && !selectedLocation) {
      const initialSelectedLocation = locationOptions.find(option => option.value === storedLocation);
      setSelectedLocation(initialSelectedLocation);
    }
  }, [storedLanguage, storedLocation, languageOptions, locationOptions, selectedLanguage, selectedLocation]);

  // Custom styles for react-select to match Bootstrap form control
  const customStyless = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#80bdff' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
      '&:hover': {
        borderColor: '#80bdff',
      },
      height: '3.3rem',
      borderRadius: '.28rem',
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
  
  // this handler function is for generating content with AI
  const handleGenerateWithAI = async () => {
    // Show confirmation dialog before overwriting existing content
    // if (description) {
    //     if (!window.confirm('This will replace the existing description. Are you sure you want to continue?')) {
    //         return;
    //     }
    // }

    setAiLoading(true);
    try {
        if (!websiteUrl) {
            toast.error("Please enter a website URL");
            return;
        }

        const response = await axios.post(
            `${REACT_PYTHON_SERVER ? REACT_PYTHON_SERVER : "https://razorcopy-py.sitepreviews.dev"}/company-business-summary`, 
            { 
                company_name: websiteUrl
            }
        );

        // Enhanced formatting of the response
        const formattedContent = `
            <div class="company-description" style="font-family: Arial, sans-serif; line-height: 1.6;">
                ${response.data.company_details
                    .split('\n\n')
                    .map(paragraph => {
                        // Handle section headers
                        if (paragraph.includes('**')) {
                            const title = paragraph.replace(/\*\*/g, '');
                            return `
                                <h3 style="
                                    color: #2c3e50;
                                    margin-top: 1.8em;
                                    margin-bottom: 0.8em;
                                    font-size: 1.4em;
                                    border-bottom: 2px solid #eee;
                                    padding-bottom: 0.3em;
                                ">${title}</h3>
                            `;
                        }
                        
                        // Handle numbered lists
                        if (paragraph.includes('1.')) {
                            const items = paragraph.split('\n').filter(item => item.trim());
                            const listItems = items.slice(1).map(item => {
                                const cleanItem = item.replace(/^\d+\.\s+\*\*([^*]+)\*\*:/, '<strong style="color: #34495e">$1:</strong>');
                                return `
                                    <li style="
                                        margin-bottom: 0.8em;
                                        line-height: 1.6;
                                        color: #444;
                                    ">${cleanItem}</li>
                                `;
                            }).join('');
                            
                            return `
                                <p style="color: #444; margin-bottom: 1em;">${items[0]}</p>
                                <ul style="
                                    margin-left: 1.5em;
                                    margin-bottom: 1.5em;
                                    list-style-type: disc;
                                ">${listItems}</ul>
                            `;
                        }
                        
                        // Regular paragraphs
                        return `
                            <p style="
                                margin-bottom: 1.2em;
                                color: #444;
                                text-align: justify;
                            ">${paragraph}</p>
                        `;
                    })
                    .join('')}
            </div>
        `;

        setDescription(formattedContent); // Update the existing description state
        toast.success("Content generated successfully!");
        
    } catch (error) {
        console.error("Error calling the API:", error);
        toast.error("Failed to generate content. Please try again.");
    } finally {
        setAiLoading(false);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent the default form submission
    }
  };

  // Function to handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      // if (competitorItems.length === 0) {
      //   toast.error("At least one competitor website is required");
      //   return;
      // }
      if (keywordItems.length === 0) {
        toast.error("At least one keyword is required");
        return;
      }
      await editProject(); // Ensure this function handles the project editing
    } else {
      // Display a toast or alert
      toast.error("Please resolve the errors before saving.");
    }
  };

  // Function to handle editing competitor items
  const handleEditCompetitorItem = (index, newValue) => {
    const updatedItems = [...competitorItems];
    updatedItems[index] = newValue;
    setCompetitorItems(updatedItems);
  };

  useEffect(() => {
    APIService.getProjectForEdit(id).then((response) => {
      if (response.data?.status) {
        let ProjectD = response.data?.data;
  
        nameInput.current.value = ProjectD?.name ? ProjectD?.name : "";
        setSelectedAssignedBy(ProjectD.assign_to);
        setProjectPermission([ProjectD.settings]);
  
        // Parse competitors_websites with enhanced error handling
        try {
          const competitors = ProjectD.competitors_websites
            ? safeJSONParse(ProjectD.competitors_websites)
            : [];
          setCompetitorItems(competitors);
        } catch (error) {
          console.error('Error parsing competitors:', error);
          setCompetitorItems([]);
        }
  
        // Use the keywords array from the API response
        const keywords = ProjectD.targeted_keywords || [];
        setKeywordItems(keywords);
  
        setStoredLanguage(ProjectD.language);
        const locations = ProjectD.location ? ProjectD.location.map(loc => loc.trim()) : [];
        setStoredLocation(locations);
        // Pre-select locations in the UI
        const initialSelectedLocations = locationOptions.filter(option => locations.includes(option.value));
        setSelectedLocation(initialSelectedLocations);
        setTargetedAudience(ProjectD.targeted_audience || "");
        setWebsiteUrl(ProjectD.website_url || "");
        setDescription(ProjectD.description || "");
      }
    });
  }, [id, locationOptions]);

  const handleAddCompetitorItem = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
        if (competitorInput.trim() !== "" && !competitorItems.includes(competitorInput.trim())) {
            // Add the competitor if it's valid
            setCompetitorItems([...competitorItems, competitorInput.trim()]);
            setCompetitorInput(""); // Clear the input
            setFormErrors({ ...formErrors, competitorInput: "" }); // Clear the error message
        } else {
            // Set the error message if the input is invalid
            setFormErrors({ ...formErrors, competitorInput: "Hit enter if you want to keep this data." });
        }
    }
  };

  const handleRemoveCompetitorItem = (index) => {
    setCompetitorItems(competitorItems.filter((_, i) => i !== index));
  };

  // Improved JSON parsing function
  const safeJSONParse = (str) => {
    try {
      // If it's already an array, return as is
      if (Array.isArray(str)) return str;
      
      // If it's already an object, return as is
      if (typeof str === 'object' && str !== null) return str;
      
      // If it's undefined or null, return empty array
      if (!str) return [];
  
      // If it's not a string, convert to string
      const inputStr = String(str);
      // Try parsing directly first
      try {
        return JSON.parse(inputStr);
      } catch (directParseError) {
        // Clean the string
        const cleaned = inputStr
          .replace(/^\s*"/, '') // Remove leading quotes and whitespace
          .replace(/"\s*$/, '') // Remove trailing quotes and whitespace
          .replace(/\\/g, '')   // Remove backslashes
          .replace(/"{2,}/g, '"') // Replace multiple quotes with single
          .replace(/"\[/g, '[')   // Fix array start
          .replace(/\]"/g, ']')   // Fix array end
          .trim();
  
        // Try parsing the cleaned string
        try {
          return JSON.parse(cleaned);
        } catch (cleanedParseError) {
          // Fallback: treat as comma-separated list
          return cleaned
            .replace(/[\[\]"]/g, '')
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
        }
      }
    } catch (error) {
      return [];
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

  const editProject = async () => {
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
      // Fetch existing project data
      const projectResponse = await APIService.getProjectForEdit(id);
      if (!projectResponse.data?.status) {
        throw new Error(
          projectResponse.data?.message || "Failed to fetch project details"
        );
      }
  
      const projectData = projectResponse.data?.data;
  
      // Parse existing keywords and titles
      let existingKeywords = [];
      let existingTitles = [];
  
      if (projectData.targeted_keywords) {
        existingKeywords = projectData.targeted_keywords
          .map((k) => k?.trim());
      }
  
      if (projectData.topic_titles) {
        try {
          existingTitles = safeJSONParse(projectData.topic_titles);
        } catch (error) {
          console.error('Error parsing topic_titles:', error);
          existingTitles = [];
        }
      }
  
      // Find new keywords
      const newKeywords = keywordItems.map(item => item.keyword).filter(
        (keyword) => !existingKeywords.includes(keyword)
      );
      
      // Generate titles for new keywords
      let newTitles = [];
      if (newKeywords.length > 0) {
        try {
          const titleResponse = await APIService.generateTitles({
            client_site_url: websiteUrl,
            competitor_urls: competitorItems,
            keywords: newKeywords,
          });
      
          if (!titleResponse.data?.status) {
            throw new Error(
              titleResponse.data?.message || "Failed to generate titles"
            );
          }
      
          // Use safeJSONParse to handle the titles
          const titlesData = titleResponse.data.data.titles;
      
          // Ensure titlesData is a string and split it by newline
          if (typeof titlesData === "string") {
            // Split by newline and clean up the format
            newTitles = titlesData
              .split("\n")
              .map(title => title.replace(/^[\d.-]+\s*/, '').trim()) // Remove leading numbers, dashes, and spaces
              .filter(title => title !== "");
          } else if (Array.isArray(titlesData)) {
            newTitles = titlesData
              .map(title => title.replace(/^[\d.-]+\s*/, '').trim()) // Remove leading numbers, dashes, and spaces
              .filter(title => title !== "");
          }
      
        } catch (error) {
          console.error("Error generating titles:", error);
          newTitles = newKeywords.map((keyword) => `Article about ${keyword}`);
        }
      }      
  
      // Combine existing and new titles
      const allTitles = [...existingTitles, ...newTitles].filter(Boolean);
  

      // Prepare update parameters
  
      const assigned_members_list = selectedAssignedBy.map((obj) => obj.id);
      const params = {
        name: nameInput.current?.value,
        assign_to: assigned_members_list,
        description: description || "",
        website_url: websiteUrl,
        language: selectedLanguage ? selectedLanguage.value : undefined,
        location: selectedLocation ? selectedLocation.map(loc => loc.value) : undefined,
        targeted_audience: TargetedAudience,
        competitors_websites: competitorItems,
        targeted_keywords: keywordItems,
        topic_titles: allTitles, // No need for JSON.stringify since it's already an array
      };

      
      // Update the project
      const updateResponse = await APIService.updateProject(id, params);
  
      if (!updateResponse.data?.status) {
        throw new Error(
          updateResponse.data?.message || "Failed to update project"
        );
      }
  
      // Create tasks only for new keywords/titles
      if (newTitles.length > 0) {
  
        // Sequential task creation with retry logic
        for (let i = 0; i < newTitles.length; i++) {
          const title = newTitles[i];
          const correspondingKeyword = newKeywords[i] || "";
          let retryCount = 0;
          const maxRetries = 3;
  
          while (retryCount < maxRetries) {
            try {
              const taskParams = new FormData();
              taskParams.append("name", title);

              taskParams.append("project_id", id);
              taskParams.append(
                "assigned_members",
                assigned_members_list
              );
              taskParams.append("description", description || "");
              taskParams.append("keywords", correspondingKeyword);
              taskParams.append(
                "competitors_websites",
                JSON.stringify(competitorItems)
              );
              taskParams.append("website_url", websiteUrl);
  
              const createTaskResponse = await APIService.addTask(formDataToObject(taskParams));
  
              if (!createTaskResponse.data?.status) {
                throw new Error(
                  createTaskResponse.data?.message ||
                    `Failed to create task for: ${title}`
                );
              }
  
              break;
            } catch (error) {
              retryCount++;
  
              if (retryCount === maxRetries) {
                toast.error(
                  `Failed to create task for "${title}" after ${maxRetries} attempts: ${error.message || error}`
                );
              } else {
                // Add a small delay before retrying
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * retryCount)
                );
              }
            }
          }
        }
      }
  
      toast.success("Project updated successfully");
      setTimeout(() => history.push("/projects"), 1500);
    } catch (error) {
      console.error("Error occurred:", error.message || error);
      toast.error(
        typeof error === "object" ? error.message || "An error occurred" : error
      );
    } finally {
      setProcess(false);
    }
  };

  const onAssignBySelect = (e) => {
    handleAssignToSearch("");
    let id = parseInt(e);
    if (id > 0) {
      let addRemovechk =
        selectedAssignedBy.filter(function (arr) {
          return arr.id === id;
        }).length > 0;
      if (!addRemovechk) {
        let newstaffList = staffList.filter(function (arr) {
          return arr.id === id;
        });
        setSelectedAssignedBy(selectedAssignedBy.concat(newstaffList));
      } else {
        let newstaffList = selectedAssignedBy.filter(function (arr) {
          return arr.id !== id;
        });
        setSelectedAssignedBy(newstaffList);
      }
    }
  };

  const handleAssignToSearch = (value) => {
    setAssignToSearch(value);
    filterDropdownOptionByName(staffList, value, setStaffListForFilter);
  };

  useEffect(() => {}, [refresh]);

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
                  await editProject();
                }}
              >
                <Row className="g-4">
                  <Col sm={12} md={4} lg={4} xl={3}>
                    <Form.Group
                      className="mb-7 w-100 validation-required"
                      controlId="roleName"
                    >
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Project Name"
                        ref={nameInput}
                        className={`form-control ${
                          formErrors.nameInput && "is-invalid"
                        }`}
                      />
                      {formErrors.nameInput && (
                        <span className="text-danger">
                          {formErrors.nameInput}
                        </span>
                      )}
                    </Form.Group>
                  </Col>
                  {/* <Col sm={12} md={4} lg={4} xl={3}>
                    <Form.Group className="mb-7 w-100" controlId="roleCode">
                      <Form.Label>Customer</Form.Label>
                      <Select styles={customStyles} className='custom-select' options={clientList} onChange={handleClientSelect}
                        value={clientList.filter(function (option) {
                          return option.value === client;
                        })} />
                      {formErrors.clientInput && (
                        <span className="text-danger">{formErrors.clientInput}</span>
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
                            {selectedAssignedBy?.map((assignUser, index) => (
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
                                        eventKey={drp.id}
                                        className={`${
                                          selectedAssignedBy.filter(function (
                                            arr
                                          ) {
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
        <Form.Group className="mb-7 w-100 validation-required" controlId="language">
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
        <Form.Group className="mb-7 w-100 validation-required" controlId="location">
          <Form.Label>Location</Form.Label>
          <VirtualizedSelect
            filterOptions={filterOptions}
            options={locationOptions}
            value={selectedLocation}
            onChange={setSelectedLocation}
            styles={customStylesForMultiSelect}
            placeholder="Select Location"
            isSearchable
            isMulti // Enable multi-select
            classNamePrefix="react-select"
          />
          {formErrors.location && (
            <span className="text-danger">
              {formErrors.location}
            </span>
          )}
        </Form.Group>
      </Col>
                  <Col sm={12} md={4} lg={4} xl={3}>
                    <Form.Group className="mb-7 w-100" controlId="websiteUrl">
                      <Form.Label>Targeted Audience</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Targeted Audience"
                        value={TargetedAudience}
                        onChange={(e) => setTargetedAudience(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="g-4">
                  <Col sm={12} md={4} lg={4} xl={3}>
                    <Form.Group className="mb-7 w-100" controlId="websiteUrl">
                      <Form.Label>Website URL</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Website URL"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={4} lg={4} xl={3}>
                  <Form.Group className="mb-7 w-100" controlId="competitors">
                      <Form.Label>Competitors Websites</Form.Label>
                      <Form.Control
                          type="text"
                          placeholder="Type and hit enter"
                          value={competitorInput}
                          onChange={(e) => {
                              setCompetitorInput(e.target.value);
                              setFormErrors({ ...formErrors, competitorInput: "" });
                          }}
                          onKeyDown={(e) => {
                              handleAddCompetitorItem(e);
                              handleKeyDown(e); // Prevent form submission
                          }}
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
                                          handleKeyDown(e); // Prevent form submission
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
              {/* <Col sm={12} md={4} lg={4} xl={3}>
  <Form.Group className="mb-7 w-100" controlId="keywords">
    <Form.Label>Targeted Keywords</Form.Label>
    <Form.Control
      type="text"
      placeholder="Type and hit enter"
      value={keywordInput}
      onChange={(e) => {
        setKeywordInput(e.target.value);
        setFormErrors({ ...formErrors, keywordInput: "" });
      }}
      onKeyDown={(e) => {
        handleAddKeywordItem(e);
        handleKeyDown(e); // Prevent form submission
      }}
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
            value={item.keyword ? item.keyword.trim() : ""} // Safely access keyword
            onChange={(e) => handleEditKeywordItem(index, e.target.value)}
            onKeyDown={(e) => {
              handleKeyDown(e); // Prevent form submission
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
</Col> */}
                  {/* <Col sm={12} md={4} lg={4} xl={3}>
                    <Form.Group className="mb-7 w-100" controlId="roleName">
                      <Form.Label>Start Date</Form.Label>
                      <SingleDatePickerControl
                        selected={date}
                        onDateChange={(date) => setDate(date)}
                        onChange={(date) => setDate(date)}
                        minDate={ (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) ? null : new Date() }
                        maxDate={dueDate}
                        isClearable
                        className={`form-control ${formErrors.date && 'is-invalid'}`}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={4} lg={4} xl={3}>
                    <Form.Group className="mb-7 w-100" controlId="roleCode">
                      <Form.Label>Due Date</Form.Label>
                      <SingleDatePickerControl
                        selected={dueDate}
                        onDateChange={(date) => setDueDate(date)}
                        onChange={(date) => setDueDate(date)}
                        minDate={ (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) ? null : date ? date : new Date() }
                        isClearable
                        className={`form-control ${formErrors.dueDate && 'is-invalid'}`}
                      />
                    </Form.Group>
                  </Col> */}
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
                              disabled={aiLoading}
                          >
                              {aiLoading ? (
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
                              value={description}
                              onChange={setDescription}
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
                    type="submit"
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

export default connect(mapStateToProps)(EditProject);
