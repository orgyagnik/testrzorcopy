import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Dropdown, Row, Col, Card, Button, Spinner, Table, ListGroup, Form } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { useParams, Link } from "react-router-dom";
import moment from 'moment';
import { pagination, display_date_format, databaseRoleCode } from '../../settings';
import { filterDropdownOptionByName, check, replaceSpecialCharacters } from "../../utils/functions.js";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { DELETE_PROJECT_MEMBER } from '../../modules/lang/Project';
import { connect } from "react-redux";
import SimpleBar from 'simplebar-react';
import SearchIcon from "../../assets/img/icons/serach.svg";
import AvatarImg from "../../assets/img/placeholder-image.png";
import linkifyHtml from 'linkify-html';
import NotFound from "../auth/NotFound";
import { format } from 'date-fns';
import UserListManager from './UserListManager.js';
import { Tabs, Tab } from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router-dom';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import axios from 'axios';
import { formDataToObject } from '../../utils/validator.js';

const REACT_PYTHON_SERVER = process.env.REACT_APP_API_PYTHON_URL;
function ProjectDetail({ name, userData }) {
    let { id } = useParams();
    const [projectDetail, setProjectDetail] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [staffListForFilter, setStaffListForFilter] = useState([]);
    const [process, setProcess] = useState(true);
    const [assignToSearch, setAssignToSearch] = useState('');
    const [checkAccess, setCheckAccess] = useState(true);
    const [editableKeywords, setEditableKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [hasPendingInput, setHasPendingInput] = useState(false);
    const [sitemapData, setSitemapData] = useState(null);
    // Add these state variables at the top
    const [formErrors, setFormErrors] = useState([]);
    const [competitorItems, setCompetitorItems] = useState([]);
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [initialLoading, setInitialLoading] = useState(true); 
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [recommendedKeywords, setRecommendedKeywords] = useState([]);
    const [targetedKeywords, setTargetedKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [targetedKeywordsVersion, setTargetedKeywordsVersion] = useState(0);
    const { Buffer } = require('buffer');

    const search = useLocation().search;
    const [searchFilter, setSearchFilter] = useState('');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [tableLoader, setTableLoader] = useState(false);
    const [sort, setSort] = useState("asc");
    const [sortby, setSortBy] = useState("keyword");
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filteredKeywords, setFilteredKeywords] = useState([]);
    const [targetedSearchFilter, setTargetedSearchFilter] = useState('');
    const [targetedPage, setTargetedPage] = useState(1);
    const [targetedTotalPages, setTargetedTotalPages] = useState(1);
    const [targetedTotalRecords, setTargetedTotalRecords] = useState(0);

    const [recommendedPage, setRecommendedPage] = useState(1);
    const [recommendedTotalPages, setRecommendedTotalPages] = useState(1);
    const [recommendedTotalRecords, setRecommendedTotalRecords] = useState(0);
    const [sitemapList, setSitemapList] = useState([]);
    const [sitemapSortBy, setSitemapSortBy] = useState("url"); // Default sorting column
    const [sitemapSortOrder, setSitemapSortOrder] = useState("asc"); // Sorting order
    const [sitemapFilteredData, setSitemapFilteredData] = useState([]); // Data after filtering & pagination
    const [sitemapSearchFilter, setSitemapSearchFilter] = useState(""); // Search input filter
    const [sitemapPage, setSitemapPage] = useState(1); // Current page
    const [sitemapPerPageSize, setSitemapPerPageSize] = useState(10); // Records per page
    const [sitemapTotalRecords, setSitemapTotalRecords] = useState(0); // Total records count
    const [sitemapTotalPages, setSitemapTotalPages] = useState(1); // Total pages count
    const [sitemapTableLoader, setSitemapTableLoader] = useState(false);
    
    const safeJSONParse = (str, defaultValue = []) => {
        if (!str) return defaultValue;
    
        try {
            if (typeof str === "string") {
                const trimmedStr = str.trim();
    
                if (trimmedStr.startsWith("{") || trimmedStr.startsWith("[")) {
                    return JSON.parse(trimmedStr);
                }
    
                return [trimmedStr];
            }
    
            return Array.isArray(str) ? str : defaultValue;
        } catch (error) {
            console.error("Failed to parse JSON:", error, "Input:", str);
            return defaultValue;
        }
    };

    const history = useHistory();

    const handleProjectEdit = async (id) => {
        history.push(`/edit-project/${id}`);
    };

    // Function to validate inputs
    const validateInputs = () => {
        let errors = { keywordInput: "" };
        
        if (keywordInput.trim() !== "" && !editableKeywords.includes(keywordInput.trim())) {
            errors.keywordInput = "Hit enter if you want to keep this data.";
        }
        
        setFormErrors(errors);
        const hasErrors = Object.values(errors).some(error => error !== "");
        setHasPendingInput(hasErrors);
        
        return !hasErrors;
    };

    // Update the useEffect where you load the initial data
    useEffect(() => {
        APIService.getProjectForEdit(id)
            .then((response) => {
                if (response.data?.status) {
                    const projectData = response.data?.data;
                    if (projectData.name === undefined) {
                        setCheckAccess(false);
                    }
                    setProjectDetail(projectData);
                    if (projectData.assign_to) {
                        setProjectMembers(projectData.assign_to);
                    }
                    // Handle targeted_keywords as a comma-separated string
                    const keywords = projectData.targeted_keywords;
                    setEditableKeywords(keywords ? keywords : []);
                }
            })
            .catch((error) => {
                console.error("Error fetching project data:", error);
        })
        .finally(() => {
        setInitialLoading(false); // Use this instead of process for initial load
            });
    }, [id]);

    useEffect(() => {
        APIService.getProjectForEdit(id)
            .then((response) => {
                if (response.data?.status) {
                    const projectData = response.data?.data;
                    
                    if (projectData.sitemapdata) {
                        setSitemapData(JSON.parse(projectData.sitemapdata));
                    }
                }
            })
            .catch((error) => {
                console.error("Error fetching sitemap data:", error);
            });
    }, [id]);
    

  
    useEffect(() => {
        const fetchRecommendedKeywords = async () => {
            setTableLoader(true);
            try {
                const projectResponse = await APIService.getProjectForEdit(id);
                const projectData = projectResponse.data?.data;

                if (!projectData?.website_url) {
                    console.warn("No website URL found for project.");
                    return;
                }

                const response = await APIService.getRecommendedKeywords({
                    projectId: id,
                    keywords: projectData.targeted_keywords,
                });

                if (response.data?.status) {
                    const keywords = response.data.data;
                    setRecommendedKeywords(keywords);
                    setFilteredKeywords(keywords);
                    setRecommendedTotalRecords(keywords.length);
                    setRecommendedTotalPages(Math.ceil(keywords.length / perPageSize));
                } else {
                    console.error("Error fetching recommended keywords:", response.data.error);
                }
                if (projectData.keywords) {
                // Process targeted keywords with their metrics
                const processedKeywords = projectData.keywords.map(kw => ({
                    keyword: kw.keyword,
                    volume: kw.volume.toString(), // Ensure volume is a string
                    difficulty: kw.difficulty, // Assume difficulty is already a string
                }));

                setTargetedKeywords(processedKeywords);
                }
            } catch (error) {
                console.error("Error fetching recommended keywords:", error);
                setRecommendedKeywords([]);
                setFilteredKeywords([]);
            } finally {
                setTableLoader(false);
            }
        };

        fetchRecommendedKeywords();
    }, [id]);

    const handleSaveSitemapData = async (sitemapData) => {
        setIsSaving(true);
        try {
            const projectResponse = await APIService.getProjectForEdit(id);
            if (!projectResponse.data?.status) {
                throw new Error("Failed to fetch project details");
            }
    
            const projectData = projectResponse.data?.data;
    
            const sitemapBase64 = Buffer.from(JSON.stringify(sitemapData)).toString("base64");

            const params = new FormData();
            params.append("detailedsitemap", sitemapBase64); // ✅ Save the new sitemap data
    
            // 🚀 Step 4: Call Update API
            const updateResponse = await APIService.updateProject(projectData.id, formDataToObject(params));
    
            if (!updateResponse.data?.status) {
                throw new Error(updateResponse.data?.message || "Failed to update sitemap data");
            }
    
            toast.success("Sitemap data saved successfully!");
        } catch (error) {
            console.error("Error saving sitemap data:", error.message || error);
            toast.error("Failed to save sitemap data.");
        } finally {
            setIsSaving(false);
        }
    };
    
    

   
        const fetchSitemapData = async (forceFetch = false) => {
            setSitemapTableLoader(true);
            toast.loading("Fetching Sitemap...");
            try {
                const projectResponse = await APIService.getProjectForEdit(id);
                const projectData = projectResponse.data?.data;
    
                if (!projectData?.website_url) {
                    console.warn("No website URL found for project.");
                    return;
                }
    
                if (!forceFetch &&projectData.detailedsitemap) {
                    let decodedSitemap = [];
                
                    try {
                        let decodedString = atob(projectData.detailedsitemap);
                        decodedSitemap = JSON.parse(decodedString);
                    } catch (error) {
                        console.error("Base64 decoding or JSON parsing error in `detailedsitemap`:", error);
                        decodedSitemap = [];
                    }
                
                    setSitemapList(decodedSitemap);
                    setSitemapTotalRecords(decodedSitemap.length);
                    setSitemapTotalPages(Math.ceil(decodedSitemap.length / sitemapPerPageSize));
                    setSitemapTableLoader(false);
                    return;
                }
                
    
                const response = await axios.post(
                    `${REACT_PYTHON_SERVER ? REACT_PYTHON_SERVER : "https://razorcopy-py.sitepreviews.dev"}/sitemap`, 
                    { 
                        url: projectData.website_url 
                    }
                );
    
                if (response.status === 200) {
                    const data = response.data;
    
                    const formattedData = data.map((page) => ({
                        url: page.url,
                        pageType: page.content_type || "Unknown",
                        metaTitle: page.meta_title || "No Title",
                        metaDescription: page.meta_description || "No Description"
                    }));
    
                    setSitemapList(formattedData);
                    setSitemapTotalRecords(formattedData.length);
                    setSitemapTotalPages(Math.ceil(formattedData.length / sitemapPerPageSize));
    
                    handleSaveSitemapData(formattedData);
                } else {
                    console.error("Error fetching sitemap data:", response.data.error);
                    setSitemapList([]);
                }
            } catch (error) {
                console.error("Error fetching sitemap data:", error);
                setSitemapList([]);
            } finally {
                setSitemapTableLoader(false);
                toast.dismiss();
            }
        };
    
        useEffect(() => {
            fetchSitemapData();
        }, [id, sitemapPage, sitemapPerPageSize, sitemapSearchFilter]);
    
    
    useEffect(() => {
        if (!sitemapList || sitemapList.length === 0) return;
    
        let updatedList = [...sitemapList];
    
        // Step 1: Apply Search Filter
        if (sitemapSearchFilter) {
            updatedList = updatedList.filter((item) =>
                item.url.toLowerCase().includes(sitemapSearchFilter.toLowerCase()) ||
                item.pageType.toLowerCase().includes(sitemapSearchFilter.toLowerCase()) ||
                item.metaTitle.toLowerCase().includes(sitemapSearchFilter.toLowerCase()) ||
                item.metaDescription.toLowerCase().includes(sitemapSearchFilter.toLowerCase())
            );
        }
    
        // Step 2: Apply Sorting
        updatedList.sort((a, b) => {
            const valA = a[sitemapSortBy]?.toString().toLowerCase() || "";
            const valB = b[sitemapSortBy]?.toString().toLowerCase() || "";
    
            return sitemapSortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    
        // Step 3: Apply Pagination Logic
        setSitemapTotalRecords(updatedList.length);
        setSitemapTotalPages(Math.ceil(updatedList.length / sitemapPerPageSize));
    
        const startIdx = (sitemapPage - 1) * sitemapPerPageSize;
        const endIdx = startIdx + sitemapPerPageSize;
        setSitemapFilteredData(updatedList.slice(startIdx, endIdx));
    
    }, [sitemapList, sitemapSearchFilter, sitemapPage, sitemapPerPageSize, sitemapSortBy, sitemapSortOrder]);
    
    
    
    
    
    
    useEffect(() => {
        if (recommendedKeywords.length > 0) {
            const filtered = recommendedKeywords.filter(keyword =>
                keyword.keyword.toLowerCase().includes(searchFilter.toLowerCase())
            );    
            setRecommendedTotalRecords(filtered.length);
            setRecommendedTotalPages(Math.ceil(filtered.length / perPageSize));
            const startIdx = (recommendedPage - 1) * perPageSize;
            const endIdx = startIdx + perPageSize;
            setFilteredKeywords(filtered.slice(startIdx, endIdx));
        }
    }, [recommendedPage, perPageSize, recommendedKeywords, searchFilter]);
    

    const updateProjectWithKeywords = async (newKeywords) => {
        setIsSaving(true);
        try {
            const projectResponse = await APIService.getProjectForEdit(id);
            if (!projectResponse.data?.status) {
                throw new Error("Failed to fetch project details");
            }
    
            const projectData = projectResponse.data?.data;
            const projectName = projectData.name;
    
            let existingKeywords = projectData.targeted_keywords
                ? projectData.targeted_keywords.map((k) => k.trim())
                : [];
    
            const uniqueNewKeywords = newKeywords.filter((k) => !existingKeywords.includes(k));
    
            if (uniqueNewKeywords.length === 0) {
                toast.info("No new keywords to approve.");
                return;
            }
    
            let keywordMetrics = {};
            uniqueNewKeywords.forEach((keyword) => {
                const keywordData = recommendedKeywords.find((item) => item.keyword === keyword);
                keywordMetrics[keyword] = {
                    volume: keywordData?.search_volume || 0,
                    difficulty: keywordData?.competition || "LOW",
                    cpc: keywordData?.cpc || 0.0,
                };
            });
    
            let newTitles = [];
            try {
                const titleResponse = await APIService.generateTitles({
                    client_site_url: websiteUrl || projectData.website_url,
                    competitor_urls: competitorItems || [],
                    keywords: uniqueNewKeywords,
                });
    
                if (!titleResponse.data?.status) {
                    throw new Error(titleResponse.data?.message || "Failed to generate titles");
                }
    
                const titlesData = titleResponse.data.data.titles;
                if (typeof titlesData === "string") {
                    newTitles = titlesData.split("\n").map((title) => title.trim()).filter((title) => title !== "");
                } else if (Array.isArray(titlesData)) {
                    newTitles = titlesData.map((title) => title.trim()).filter((title) => title !== "");
                }
            } catch (error) {
                console.error("Error generating titles:", error);
                newTitles = uniqueNewKeywords.map((keyword) => `Article about ${keyword}`);
            }
    
            const params = new FormData();
            params.append("targeted_keywords", [...existingKeywords, ...uniqueNewKeywords]);
            params.append("name", projectName);
            params.append("description", projectData.description || "");
            params.append("website_url", projectData.website_url || "");

            // Check if competitors_websites has values before appending
            const competitorsWebsites = safeJSONParse(projectData.competitors_websites);
            if (competitorsWebsites.length > 0) {
                params.append("competitors_websites", JSON.stringify(competitorsWebsites));
            }
            
            params.append("clientid", projectData.clientid);
            params.append("topic_titles", JSON.stringify([...projectData.topic_titles || [], ...newTitles].filter(Boolean)));
    
            const assignedMembers = projectData.assign_members?.map((m) => m.id) || [];
            if (!assignedMembers.includes(userData?.id)) {
                assignedMembers.push(userData?.id);
            }
            params.append("assigned_members", assignedMembers.join(","));
    
            const updateResponse = await APIService.updateProject(projectData.id, params);
            if (!updateResponse.data?.status) {
                throw new Error("Failed to update project keywords");
            }
    
            for (let i = 0; i < newTitles.length; i++) {
                const title = newTitles[i];
                const correspondingKeyword = uniqueNewKeywords[i] || "";
                const metrics = keywordMetrics[correspondingKeyword] || {};
    
                try {
                    let taskParams = new FormData();
                    taskParams.append("name", title);
                    taskParams.append("project_id", projectData.id);
                    taskParams.append("rel_id", projectData.id);
                    taskParams.append("rel_type", "project");
                    taskParams.append("task_type", 0);
                    taskParams.append("status", 60);
                    taskParams.append("addedfrom", userData?.id);
                    taskParams.append("project_name", projectData.name);
                    taskParams.append("clientid", projectData.clientid);
                    taskParams.append("start_date", format(new Date(), "yyyy-MM-dd"));
                    if (projectData.due_date) {
                        taskParams.append("due_date", format(new Date(projectData.due_date), "yyyy-MM-dd"));
                    }
                    taskParams.append("assigned_members", assignedMembers.join(","));
                    taskParams.append("description", projectData.description || "");
                    taskParams.append("keywords", correspondingKeyword);

                    if (projectData.competitors_websites && projectData.competitors_websites.length > 0) {
                        params.append("competitors_websites", JSON.stringify(projectData.competitors_websites));
                    }

                    taskParams.append("website_url", projectData.website_url || "");    
                    taskParams.append("keyword_volume", metrics.volume);
                    taskParams.append("keyword_difficulty", metrics.difficulty);
                   // taskParams.append("keyword_cpc", metrics.cpc);
    
                    const createTaskResponse = await APIService.addTask(taskParams);
                    if (!createTaskResponse.data?.status) {
                        throw new Error(createTaskResponse.data?.message || `Failed to create task for: ${title}`);
                    }
                } catch (error) {
                    console.error(`Error creating task for ${title}:`, error);
                }
            }
    
            setTargetedKeywords((prevKeywords) => [
                ...prevKeywords,
                ...uniqueNewKeywords.map((k) => {
                    const dbKeyword = projectDetail.keywords.find((item) => item.keyword === k);
                    const recommendedKeyword = recommendedKeywords.find((item) => item.keyword === k);
            
                    return {
                        keyword: k,
                        volume: dbKeyword?.volume || recommendedKeyword?.search_volume || "N/A",
                        difficulty: dbKeyword?.difficulty || recommendedKeyword?.competition || "N/A",
                        cpc: dbKeyword?.cpc || recommendedKeyword?.cpc || "N/A",
                    };
                }),
            ]);
            
    
            setRecommendedKeywords((prev) => prev.filter((k) => !uniqueNewKeywords.includes(k.keyword)));
            setSelectedKeywords([]);
    
            toast.success(`Approved ${uniqueNewKeywords.length} keyword(s), created tasks & saved metrics!`);
            setTargetedKeywordsVersion((prev) => prev + 1);
        } catch (error) {
            console.error("Error updating project keywords:", error);
            toast.error("Failed to move keywords.");
        } finally {
            setIsSaving(false);
        }
    };
    
    
    
    
    

    
      const handleApproveSingle = (keyword) => {
        updateProjectWithKeywords([keyword.keyword]);
      };
    
      const handleCheckboxChange = (keyword) => {
        setSelectedKeywords((prev) =>
          prev.includes(keyword)
            ? prev.filter((k) => k !== keyword)
            : [...prev, keyword]
        );
      };
    
      const handleApproveMultiple = () => {
        updateProjectWithKeywords(selectedKeywords.map((k) => k.keyword));
      };
    

    useEffect(() => {
        // Filter keywords based on the search filter
        const filtered = recommendedKeywords.filter(keyword => {
            const searchLower = searchFilter.toLowerCase();
            return (
                keyword.keyword.toLowerCase().includes(searchLower) ||
                keyword.search_volume.toString().includes(searchLower) ||
                keyword.competition.toLowerCase().includes(searchLower)
            );
        });
        setFilteredKeywords(filtered);
        setTotalRecords(filtered.length);
        setTotalPages(Math.ceil(filtered.length / perPageSize));
    }, [searchFilter, recommendedKeywords, perPageSize]);

    // Helper function to capitalize each word in a string
    const capitalizeWords = (str) => {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    };

    const handleAddKeyword = (e) => {
        if (e.key === 'Enter') {
            // Capitalize the input
            const capitalizedKeyword = capitalizeWords(keywordInput.trim());

            // Validate the input
            if (capitalizedKeyword !== "" && !editableKeywords.includes(capitalizedKeyword)) {
                // Add the keyword with default metrics
                setEditableKeywords([...editableKeywords, capitalizedKeyword]);
                setTargetedKeywords((prevKeywords) => [
                    ...prevKeywords,
                    { keyword: capitalizedKeyword, volume: "N/A", difficulty: "N/A", cpc: "N/A" }
                ]);
                setKeywordInput(""); // Clear the input
                setFormErrors({ ...formErrors, keywordInput: "" }); // Clear the error message
            } else {
                // Set the error message if the input is invalid
                setFormErrors({ ...formErrors, keywordInput: "Hit enter if you want to keep this data." });
            }
        }
    };

    // Function to handle saving keywords
    const handleSaveKeywords = async (e) => {
        e.preventDefault();
        if (!validateInputs()) {
            toast.error("Please submit any pending input in the fields before saving.");
            return;
        }
    
        setIsSaving(true);
        setFormErrors([]);
    
        try {
            // Fetch existing project data
            const projectResponse = await APIService.getProjectForEdit(id);
            if (!projectResponse.data?.status) {
                throw new Error(projectResponse.data?.message || "Failed to fetch project details");
            }
    
            const projectData = projectResponse.data?.data;
    
            // Parse existing keywords
            let existingKeywords = [];
            if (projectData.targeted_keywords) {
                existingKeywords = projectData.targeted_keywords
                    .map(k => k.trim())
                    .filter(Boolean);
            }
    
            // Parse existing titles
            let existingTitles = [];
            if (projectData.topic_titles) {
                try {
                    if (typeof projectData.topic_titles === 'string') {
                        const cleanedTitlesString = projectData.topic_titles
                            .replace(/\\/g, '')
                            .replace(/"\[/g, '[')
                            .replace(/\]"/g, ']')
                            .replace(/"""/g, '"')
                            .replace(/^"/, '')
                            .replace(/"$/, '');
                            
                        existingTitles = JSON.parse(cleanedTitlesString);
                    } else {
                        existingTitles = projectData.topic_titles;
                    }
                } catch (error) {
                    console.error("Error parsing existing titles:", error);
                    try {
                        existingTitles = projectData.topic_titles
                            .replace(/[\[\]"]/g, '')
                            .split(',')
                            .map(title => title.trim())
                            .filter(Boolean);
                    } catch (e) {
                        console.error("Fallback parsing failed:", e);
                        existingTitles = [];
                    }
                }
            }
    
            // Identify all keywords including new ones
            const newKeywords = editableKeywords
                .map(k => k.trim())
                .filter(k => !existingKeywords.includes(k));
            // Withhold updating 'targetedKeywords' state here
    
            // Generate titles for new keywords
            let newTitles = [];
            if (newKeywords.length > 0) {
                try {
                    const titleResponse = await APIService.generateTitles({
                        client_site_url: websiteUrl || projectData.website_url,
                        competitor_urls: competitorItems || [],
                        keywords: newKeywords,
                    });
    
                    if (!titleResponse.data?.status) {
                        throw new Error(titleResponse.data?.message || "Failed to generate titles");
                    }
    
                    const titlesData = titleResponse.data.data.titles;
                    if (typeof titlesData === "string") {
                        newTitles = titlesData
                            .split("\n")
                            .map(title => title.replace(/^[\d.-]+\s*/, '').trim())
                            .filter(title => title !== "");
                    } else if (Array.isArray(titlesData)) {
                        newTitles = titlesData
                            .map(title => title.replace(/^[\d.-]+\s*/, '').trim())
                            .filter(title => title !== "");
                    }
                } catch (error) {
                    console.error("Error generating titles:", error);
                    newTitles = newKeywords.map(keyword => `Article about ${keyword}`);
                }
            }
    
            // Combine existing and new titles
            const allTitles = [...existingTitles, ...newTitles].filter(Boolean);
    
            // Prepare update parameters
            const params = new FormData();
            params.append("projectid", id);
            params.append("name", projectData.name);
            params.append("clientid", projectData.clientid);
            params.append("settings", JSON.stringify(projectData.settings));
            params.append("description", projectData.description || "");
            params.append("website_url", projectData.website_url || "");
    
            // Ensure valid competitors websites before appending
            const competitorsWebsites = safeJSONParse(projectData.competitors_websites);
            if (competitorsWebsites.length > 0) {
                params.append("competitors_websites", JSON.stringify(competitorsWebsites));
            }
    
            params.append("targeted_keywords", editableKeywords);
            params.append("topic_titles", JSON.stringify(allTitles));
    
            // Ensure we have assigned members
            const assignedMembers = projectData.assign_members?.map(m => m.id) || [];
            if (!assignedMembers.includes(userData?.id)) {
                assignedMembers.push(userData?.id);
            }
            params.append("assigned_members", assignedMembers.join(","));
    
            if (projectData.start_date) params.append("start_date", format(new Date(projectData.start_date), "yyyy-MM-dd"));
            if (projectData.due_date) params.append("due_date", format(new Date(projectData.due_date), "yyyy-MM-dd"));
    
            // Update the project
            const updateResponse = await APIService.updateProject(params);
            
            if (!updateResponse.data?.status) {
                throw new Error(updateResponse.data?.message || "Failed to update project");
            }
    
            // Create tasks for new keywords/titles
            if (newTitles.length > 0) {
                await createTasksForNewTitles(newTitles, newKeywords, projectData, assignedMembers);
            }
    
            toast.success("Project updated successfully!");
            setIsEditing(false);
    
        } catch (error) {
            console.error("Error updating project:", error.message || error);
            toast.error(error.message || "Failed to update project");
        } finally {
            setProcess(false);
            setIsSaving(false);
        }
    };
    
// Updated Helper Function with Additional Functionality
const createTasksForNewTitles = async (newTitles, newKeywords, projectData, assignedMembers) => {
    // Fetch metrics for new keywords during task creation
    let metricsData = [];
    if (newKeywords.length > 0) {
        try {
            const metricsResponse = await APIService.fetchKeywordMetrics({ keywords: newKeywords });
            if (metricsResponse.data?.success) {
                metricsData = metricsResponse.data.data;
            } else {
                console.error("Failed to fetch keyword metrics:", metricsResponse.data?.message);
            }
        } catch (error) {
            console.error("Fetch Keyword Metrics Error:", error.message);
        }
    }

    // Merge existing keywords with new metrics
    const updatedKeywords = targetedKeywords.map(existingKeyword => {
        const metrics = metricsData.find(m => m.keyword === existingKeyword.keyword) || {};
        return {
            keyword: existingKeyword.keyword,
            volume: metrics.keyword_volume || existingKeyword.volume || "N/A",
            difficulty: metrics.keyword_difficulty || existingKeyword.difficulty || "N/A",
            cpc: metrics.keyword_cpc || existingKeyword.cpc || "N/A"
        };
    });

    // Add new keywords that are not in the existing list
    newKeywords.forEach(newKeyword => {
        if (!updatedKeywords.some(k => k.keyword === newKeyword)) {
            const metrics = metricsData.find(m => m.keyword === newKeyword) || {};
            updatedKeywords.push({
                keyword: newKeyword,
                volume: metrics.keyword_volume || "N/A",
                difficulty: metrics.keyword_difficulty || "N/A",
                cpc: metrics.keyword_cpc || "N/A"
            });
        }
    });

    setTargetedKeywords(updatedKeywords);

    // Create tasks for fetched metrics
    for (let i = 0; i < newTitles.length; i++) {
        const title = newTitles[i];
        const correspondingKeyword = newKeywords || "";
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                let keywordMetrics = { keyword_volume: 0, keyword_difficulty: 0 };
                if (correspondingKeyword) {
                    try {
                        const metrics = metricsData.find(m => m.keyword === correspondingKeyword) || {};
                        keywordMetrics.keyword_volume = metrics.keyword_volume || 0;
                        keywordMetrics.keyword_difficulty = metrics.keyword_difficulty || 0;
                    } catch (error) {
                        console.error("Keyword Metrics Error:", error.message);
                    }
                }

                const taskParams = new FormData();
                taskParams.append("name", title);
                taskParams.append("project_id", projectData.id);
                taskParams.append(
                    "task_type",
                    userData?.role_code === databaseRoleCode.clientCode
                        ? userData?.current_plan.includes("addons")
                            ? 1
                            : 0
                        : 0
                );
                taskParams.append("status", 'pending');
                taskParams.append("addedfrom", userData?.id);
                taskParams.append("project_name", projectData.name);
                taskParams.append("clientid", projectData.clientid);
                taskParams.append("start_date", format(new Date(), "yyyy-MM-dd"));
                if (projectData.due_date) {
                    taskParams.append("due_date", format(new Date(projectData.due_date), "yyyy-MM-dd"));
                }
                taskParams.append("assigned_members", assignedMembers.join(","));
                taskParams.append("description", projectData.description || "");
                taskParams.append("keywords", JSON.stringify(correspondingKeyword));

                if (projectData.competitors_websites && projectData.competitors_websites.length > 0) {
                    taskParams.append("competitors_websites", JSON.stringify(projectData.competitors_websites));
                }   

                taskParams.append("website_url", projectData.website_url || "");

                // Include fetched metrics
                taskParams.append("keyword_volume", Number(keywordMetrics.keyword_volume));
                taskParams.append("keyword_difficulty", keywordMetrics.keyword_difficulty);

                // Create the task
                const createTaskResponse = await APIService.addTask(taskParams);

                if (!createTaskResponse.data?.status) {
                    throw new Error(createTaskResponse.data?.message || `Failed to create task for: ${title}`);
                }

                break; // Exit retry loop on success
            } catch (error) {
                console.error(`Task creation error (attempt ${retryCount + 1}):`, error);
                retryCount++;
                if (retryCount === maxRetries) {
                    toast.error(`Failed to create task for "${title}" after ${maxRetries} attempts`);
                } else {
                    // Wait before retrying
                    await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
                }
            }
        }
    }
};
    

    useEffect(() => {
        APIService.getProjectForEdit(id)
        .then((response) => {
            if (response.data?.status) {
                const projectData = response.data?.data;
                if (projectData.name === undefined) {
                    setCheckAccess(false);
                }
                setProjectDetail(projectData);
                if (projectData.assign_members) {
                    setProjectMembers(projectData.assign_members);
                }
                const keywords = projectData.keywords;
                const filteredKeywords = keywords.filter(keyword =>
                    keyword.keyword.toLowerCase().includes(targetedSearchFilter.toLowerCase())
                );

                setTargetedTotalRecords(filteredKeywords.length);
                setTargetedTotalPages(Math.ceil(filteredKeywords.length / perPageSize));
                if (keywords) {
                    setTargetedKeywords(
                        projectData.keywords.map((k) => ({
                            keyword: k.keyword,
                            volume: k.keyword_volume || "N/A",
                            difficulty: k.keyword_difficulty || "N/A",
                            cpc: k.cpc || "N/A",
                        }))
                    );
                }
                const startIdx = (targetedPage - 1) * perPageSize;
                const endIdx = targetedPage * perPageSize;
                const paginatedKeywords = keywords.slice(startIdx, endIdx);

                setTargetedKeywords(paginatedKeywords);

                setEditableKeywords(keywords ? keywords.split(',') : []);
                setProcess(false);
            }
        })
        .catch((error) => {
            console.error("Error fetching project data:", error);
            setProcess(false);
            });

        APIService.getAllMembers('')
            .then((response) => {
                if (response.data?.status) {
                    setStaffList(response.data?.data);
                    setStaffListForFilter(response.data?.data.map(item => ({
                        ...item,
                        is_checked: projectMembers.some(pm => pm.id === item.staffid)
                    })));
                }
                else {
                    setStaffList([]);
                    setStaffListForFilter([]);
                }
            });
    }, [id, targetedPage, perPageSize, targetedSearchFilter]); 

    useEffect(() => {
        setStaffListForFilter(staffList.map(item => ({
            ...item,
            is_checked: projectMembers.some(pm => pm.id === item.staffid)
        })));
    }, [projectMembers]);

    const handleProjectMemberDelete = (assignId, name) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_PROJECT_MEMBER.replace("{user_name}", name),
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["staffId"] = assignId;
                        params["projectId"] = id;
                        APIService.deleteProjectMember(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    APIService.getProjectForEdit(id)
                                    .then((response) => {
                                        if (response.data?.status) {
                                            setProjectMembers([...response.data?.data.assign_to]);
                                        }
                                    });
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

    const handleAssignToSearch = (value) => {
        setAssignToSearch(value);
        filterDropdownOptionByName(staffList, value, setStaffListForFilter);
    }

    const handleAddRemoveMembers = (e) => {
        handleAssignToSearch('');
        let assignId = e.target.value;
        if (e.target.checked) {
            let params = {};
            params["staffId"] = e.target.value;
            params["projectId"] = id;
            APIService.addProjectMember(params)
                .then((response) => {
                    if (response.data?.status) {
                        APIService.getProjectForEdit(id)
                        .then((response) => {
                            if (response.data?.status) {
                                setProjectMembers([...response.data?.data.assign_to]);
                            }
                        });
                    }
                    else {
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                });
        }
        else {
            handleProjectMemberDelete(assignId, e.target.name);
        }
    };
    const handleSort = (column) => {
        if (sitemapSortBy === column) {
            setSitemapSortOrder(sitemapSortOrder === "asc" ? "desc" : "asc");
        } else {
            setSitemapSortBy(column);
            setSitemapSortOrder("asc");
        }
    };
    const sortIcon = (column) => {
        return sortby === column ? (
            sort === "asc" ? (
                <i className="bi bi-arrow-up-short"></i>
            ) : (
                <i className="bi bi-arrow-down-short"></i>
            )
        ) : (
            <i className="bi bi-arrow-down-up"></i>
        );
    };
    
    const sitemapColumns = [
        {
            Header: () => (
                <span onClick={() => handleSort("url")}>
                    URL {sortIcon("url")}
                </span>
            ),
            accessor: "url",
            Cell: ({ value }) => (
                <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
            ),
        },
        {
            Header: () => (
                <span onClick={() => handleSort("pageType")}>
                    Page Type {sortIcon("pageType")}
                </span>
            ),
            accessor: "pageType",
        },
        {
            Header: () => (
                <span onClick={() => handleSort("metaTitle")}>
                    Meta Title {sortIcon("metaTitle")}
                </span>
            ),
            accessor: "metaTitle",
        },
        {
            Header: () => (
                <span onClick={() => handleSort("metaDescription")}>
                    Meta Description {sortIcon("metaDescription")}
                </span>
            ),
            accessor: "metaDescription",
        }
    ];
    // Define columns for targeted keywords similar to sitemapColumns
    const targetedKeywordsColumns = [
        {
            Header: 'Keyword',
            accessor: 'keyword', // This matches the key in your data objects
        },
        {
            Header: 'Search Volume',
            accessor: 'volume', // This matches the key in your data objects
            // Check if value is not undefined or null before converting to string
            Cell: ({ value }) => value !== undefined && value !== null ? value.toString() : '',
        },
        {
            Header: 'Competition',
            accessor: 'difficulty', // This matches the key in your data objects
            // Check if value is not undefined or null before converting to string
            Cell: ({ value }) => value !== undefined && value !== null ? value.toString() : '',
        },
    ];
    

    return (
        <>
            {checkAccess ? (
                <>
                    <Sidebar />
                    <UserListManager />
                    <div className="main-content">
                        <Header pagename={name} />
                        <div className="inner-content pt-0 px-0">
                            <div className="project-detail-page">
                                {!process && (
                                    <>
                                    <div className="px-0">
                                        <Card className="p-2 p-2 mb-5">
                                            <Card.Body className="p-0 project-detail-table">
                                                <div className="project-detail-page">
                                                    {!process && (
                                                        <>
                                                        <div className="project-nav-bar d-flex justify-content-between align-items-center">
                                                            <div className="project-name mx-5 fs-20">
                                                                {projectDetail?.name}
                                                            </div>
                                                            <div>
                                                                <button
                                                                    className="btn btn-primary mx-2 fs-6"
                                                                    onClick={() => window.location.href = `/tasks?projectId=${projectDetail?.id}`}
                                                                >
                                                                    View Tasks
                                                                </button>
                                                                <button
                                                                    className="btn btn-primary mx-2 fs-6"
                                                                    onClick={() => window.location.href = `/article-tasks?projectId=${projectDetail?.id}`}
                                                                >
                                                                    View Articles
                                                                </button>
                                                            </div>
                                                        </div>
                                                        </>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                    <Tabs
                                        id="project-detail-tabs"
                                        activeKey={activeTab}
                                        onSelect={(k) => setActiveTab(k)}
                                        className="mb-3 d-flex justify-content-center"
                                    >                    
                                                                   
                                                                    <Tab eventKey="overview" title="Overview">
                                                                        {activeTab === 'overview' && (
                                                                            <div className='pt-9 px-4 px-lg-7'>
                                                                            <Row>
                                                                        <Col xs={12} md={6} className="mx-auto">
                                                                            <Card className="rounded-10 border border-gray-100 mb-4">
                                                                                <Card.Body className="p-0">
                                                                                    <div className="d-flex align-items-center justify-content-between px-3 px-md-4 py-3 border-bottom border-gray-100 rounded-top">
                                                                                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Overview</h3>
                                                                                        <div className="text-end">
                                                                                            <button
                                                                                                className="btn btn-primary btn-sm"
                                                                                                size="md"
                                                                                                onClick={() => handleProjectEdit(projectDetail?.id)}
                                                                                            >
                                                                                                Edit Project
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </Card.Body>
                                                                                <Card.Body className="px-md-4 py-4">
                                                                                    <div className="px-md-3 py-md-3">
                                                                                        <div className="table-responsive">
                                                                                            <Table hover size="md" className="list-table border-top-0">
                                                                                                <tbody>
                                                                                                    <tr>
                                                                                                        <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Project #</td>
                                                                                                        <td className="d-block d-md-table-cell">{projectDetail?.id}</td>
                                                                                                    </tr>
                                                                                                    {projectDetail?.agency_id !== 0 && (
                                                                                                        <tr>
                                                                                                            <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Agency</td>
                                                                                                            <td className="d-block d-md-table-cell">
                                                                                                                {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ? (
                                                                                                                    <Link to={`/agency-user-detail/${projectDetail?.agency_id}`}>{projectDetail?.agency_name}</Link>
                                                                                                                ) : (
                                                                                                                    projectDetail?.agency_name
                                                                                                                )}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    )}
                                                                                                    <tr>
                                                                                                        <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Date Created</td>
                                                                                                        <td className="d-block d-md-table-cell">{projectDetail.created_at && moment(projectDetail.project_created).format(display_date_format)}</td>
                                                                                                    </tr>
                                                                                                    {projectDetail.start_date && moment(projectDetail.start_date).format(display_date_format) !== "11-30-1899" && (
                                                                                                        <tr>
                                                                                                            <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Start Date</td>
                                                                                                            <td className="d-block d-md-table-cell">{projectDetail.start_date && moment(projectDetail.start_date).format(display_date_format)}</td>
                                                                                                        </tr>
                                                                                                    )}
                                                                                                    <tr>
                                                                                                        <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Website URL</td>
                                                                                                        <td className="d-block d-md-table-cell">
                                                                                                            <a href={`http://${projectDetail.website_url}`} target="_blank" rel="noopener noreferrer" className="text-break">
                                                                                                                {projectDetail.website_url}
                                                                                                            </a>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Competitors Websites</td>
                                                                                                        <td className="d-block d-md-table-cell">
                                                                                                            {safeJSONParse(projectDetail.competitors_websites, []).map((website, index) => (
                                                                                                                <div key={index}>
                                                                                                                    <a href={`http://${website}`} target="_blank" rel="noopener noreferrer" className="text-break">
                                                                                                                        {website}
                                                                                                                    </a>
                                                                                                                </div>
                                                                                                            ))}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Language</td>
                                                                                                        <td className="d-block d-md-table-cell">
                                                                                                            {safeJSONParse(projectDetail.language, []).join(", ")}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Location</td>
                                                                                                        <td className="d-block d-md-table-cell">
                                                                                                            {safeJSONParse(projectDetail.location, []).join(", ")}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Targeted Audience</td>
                                                                                                        <td className="d-block d-md-table-cell">
                                                                                                            {safeJSONParse(projectDetail.targeted_audience, []).join(", ")}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </Table>
                                                                                        </div>
                                                                                    </div>
                                                                                </Card.Body>
                                                                            </Card>
                                                                        </Col>
                                                                        <Col xs={12} md={6} className="mx-auto">
                                                                            <Card className="rounded-10 border border-gray-100 mb-4">
                                                                                <Card.Body className="p-0">
                                                                                    <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                                                                                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Business Details</h3>
                                                                                    </div>
                                                                                </Card.Body>
                                                                                <Card.Body className="px-md-4 py-4">
                                                                                    <div className="px-md-3 py-md-3">
                                                                                        <div dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(projectDetail.description !== undefined && projectDetail.description !== null && projectDetail.description !== "undefined" ? projectDetail.description : '<p class="text-muted">No description for this project</p>')).replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></div>
                                                                                    </div>
                                                                                </Card.Body>
                                                                            </Card>
                                                                        </Col>
                                                                    </Row>
        </div>
    )}
</Tab>
<Tab eventKey="keywords" title="Keywords">
    {activeTab === 'keywords' && (
        <div className='pt-9 px-4 px-lg-7'>
            <Row>
            <Col xs={12} md={6} className="mx-auto">
                    <Card className="rounded-10 border border-gray-100 mb-4">
                        <Card.Body className="p-0">
                            <div className="d-flex align-items-center justify-content-between px-3 px-md-4 py-3 border-bottom border-gray-100">
                                <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Targeted Keywords</h3>
                                {isEditing ? (
                                    <div>
                                        <Button
                                            disabled={process}
                                            className="me-2 btn btn-sm"
                                            variant="soft-secondary"
                                            size="md"
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={isSaving}
                                            variant="primary"
                                            size="md"
                                            type="button"
                                            onClick={handleSaveKeywords}
                                            className="btn btn-sm"
                                        >
                                            {isSaving ? (
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
                                            ) : (
                                                "Save"
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        className="btn btn-primary btn-sm"
                                        disabled={false}
                                        variant="primary"
                                        size="md"
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                        <Card.Body className="px-md-4 py-4">
                            <div className="px-md-3 py-md-3">
                                {isEditing && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Type and hit enter"
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e.target.value)}
                                            onKeyDown={handleAddKeyword}
                                            className={`form-control ${formErrors.keywordInput ? 'is-invalid' : ''}`}
                                            style={{ marginBottom: "10px" }}
                                        />
                                        {formErrors.keywordInput && (
                                            <span className="text-danger">{formErrors.keywordInput}</span>
                                        )}
                                    </>
                                )}
                                <DataTableWithPagination
                                    columns={targetedKeywordsColumns}
                                    data={targetedKeywords} 
                                    searchFilter={targetedSearchFilter}
                                    setSearchFilter={setTargetedSearchFilter}
                                    pageNumber={targetedPage}
                                    setPageNumber={setTargetedPage}
                                    perPageSize={perPageSize}
                                    setPerPageSize={setPerPageSize}
                                    loading={tableLoader}
                                    totalPages={targetedTotalPages}
                                    totalRecords={targetedTotalRecords}
                                    showExportButton={false}
                                    sortby={sortby}
                                    sortOrder={sort}
                                    setSort={setSort}
                                    setSortingBy={setSortBy}
                                />



                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={6}>
    <Card className="rounded-10 border border-gray-100 mb-4">
        <Card.Body className="p-0">
            <div className="d-flex align-items-center justify-content-between px-3 px-md-4 py-3 border-bottom border-gray-100">
                <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Recommended Keywords</h3>
                {selectedKeywords.length > 0 && (
                    <Button
                        variant="primary"
                        className="btn btn-sm"
                        onClick={handleApproveMultiple}
                        disabled={isSaving}
                    >
                        {isSaving ? (
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
                        ) : (
                            <>Mark as Approved ({selectedKeywords.length})</>
                        )}
                    </Button>
                )}
            </div>
        </Card.Body>
        <Card.Body className="px-md-4 py-4">
            <div className="px-md-3 py-md-3">
                <DataTableWithPagination
                    columns={[
                        {
                            Header: (
                                <Form.Check
                                    type="checkbox"
                                    style={{ transform: 'scale(0.7)' }}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedKeywords([...filteredKeywords]);
                                        } else {
                                            setSelectedKeywords([]);
                                        }
                                    }}
                                />
                            ),
                            accessor: "select",
                            Cell: ({ row }) => (
                                <Form.Check
                                    type="checkbox"
                                    style={{ transform: 'scale(0.7)' }}
                                    checked={selectedKeywords.includes(row.original)}
                                    onChange={() => handleCheckboxChange(row.original)}
                                />
                            ),
                        },
                        { Header: "Keyword", accessor: "keyword" },
                        { Header: "Search Volume", accessor: "search_volume" },
                        { Header: "Competition", accessor: "competition" },
                        //{ Header: "CPC ($)", accessor: "cpc" },
                        {
                            Header: "✔",
                            accessor: "approve",
                            Cell: ({ row }) => (
                                <Button
                                    variant="btn rounded-5 p-1 btn-success"
                                    size="xs"
                                    onClick={() => handleApproveSingle(row.original)}
                                >
                                    ✔
                                </Button>
                            ),
                        },
                    ]}
                    data={filteredKeywords}
                    searchFilter={searchFilter}
                    setSearchFilter={setSearchFilter}
                    pageNumber={recommendedPage}
                    setPageNumber={setRecommendedPage}
                    perPageSize={perPageSize}
                    setPerPageSize={setPerPageSize}
                    loading={tableLoader}
                    totalPages={recommendedTotalPages}
                    totalRecords={recommendedTotalRecords}
                    sortby={sortby}
                    sortOrder={sort}
                    setSort={setSort}
                    setSortingBy={setSortBy}
                />
            </div>
        </Card.Body>
    </Card>
</Col>
            </Row>
        </div>
    )}
</Tab>
<Tab eventKey="members" title="Members">
    {activeTab === 'members' && (
        <div className='pt-9 px-4 px-lg-7'>
            <Row>
                <Col xs={12} xl={5} xxl={5} className="mx-auto">
                    <Card className="rounded-10 border border-gray-100 mb-4">
                        <Card.Body className="p-0">
                            <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                                <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Members</h3>
                                <Dropdown className="project-drop-down category-dropdown ms-auto pe-md-3" autoClose="outside">
                                    {check(['projects.update'], userData?.role.getPermissions) && (
                                        <Dropdown.Toggle as="a" bsPrefix="d-toggle" className="btn btn-dark-100 btn-icon btn-sm rounded-circle btn-sm shadow-none" id="dropdown-basic">
                                            <i className="icon-add"></i>
                                        </Dropdown.Toggle>
                                    )}
                                    <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                                        <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                            <div className="search-box w-100">
                                                <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                    <img src={SearchIcon} alt="Search" />
                                                    <input type="search" className="form-control border-0" placeholder="Name" value={assignToSearch} onChange={(e) => handleAssignToSearch(e.target.value)} />
                                                </div>
                                            </div>
                                        </Dropdown.Header>
                                        <SimpleBar className="dropdown-body">
                                            {staffListForFilter.map((drp, index_staff) => (
                                                <Dropdown.Item as="li" key={index_staff}>
                                                    <Form.Check className="m-0 form-check-sm" type="checkbox" name={drp.name} label={drp.name} id={`categorycheckbox${drp.staffid}`} checked={drp.is_checked} value={drp.staffid} onChange={handleAddRemoveMembers} />
                                                </Dropdown.Item>
                                            ))}
                                        </SimpleBar>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </Card.Body>
                        <Card.Body className="px-md-4 py-4">
                            <div className="px-md-3">
                                <ListGroup className="list-group-flush">
                                    {projectMembers.length > 0 && projectMembers.map((assignUser, index) => (
                                        <ListGroup.Item key={index}>
                                            <div className="row align-items-center px-md-2">
                                                <div className="col-auto">
                                                    <span className="avatar avatar-circle avatar-border">
                                                        {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ? (
                                                            <Link to={`${assignUser.is_not_staff === 1 ? '/agency-user-detail/' : '/user-detail/'}${assignUser.id}`}>
                                                                {assignUser.profile_image !== '' && assignUser.profile_image !== null ? (
                                                                    <img className="avatar-img" src={`${assignUser.profile_image}`} alt={assignUser.name} onError={({ currentTarget }) => {
                                                                        currentTarget.onerror = null;
                                                                        currentTarget.src = AvatarImg;
                                                                    }} />
                                                                ) : (
                                                                    <img className="avatar-img" src={AvatarImg} alt={assignUser.firstname + ' ' + assignUser.lastname} />
                                                                )}
                                                            </Link>
                                                        ) : (
                                                            <>
                                                                {assignUser.profile_image !== '' && assignUser.profile_image !== null ? (
                                                                    <img className="avatar-img" src={AvatarImg} alt={assignUser.name} onError={({ currentTarget }) => {
                                                                        currentTarget.onerror = null;
                                                                        currentTarget.src = AvatarImg;
                                                                    }} />
                                                                ) : (
                                                                    <img className="avatar-img" src={AvatarImg} alt={assignUser.name} />
                                                                )}
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="col p-0">
                                                    <h6 className="mb-1 font-weight-semibold">
                                                        {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ? (
                                                            <Link to={`${assignUser.is_not_staff === 1 ? '/agency-user-detail/' : '/user-detail/'}${assignUser.id}`}>{assignUser.firstname + ' ' + assignUser.lastname}</Link>
                                                        ) : (
                                                            assignUser.firstname + ' ' + assignUser.lastname
                                                        )}
                                                    </h6>
                                                    {assignUser.designation && (
                                                        <p className="card-text small text-gray-600 lh-sm">{assignUser.designation}</p>
                                                    )}
                                                </div>
                                                {check(['projects.update'], userData?.role.getPermissions) && (
                                                    <div className="col-auto">
                                                        <Button variant="soft-danger" className="btn-icon circle-btn" onClick={() => { handleProjectMemberDelete(assignUser.id, assignUser.name) }}><i className="icon-delete"></i></Button>
                                                    </div>
                                                )}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )}
</Tab>

<Tab eventKey="sitemaps" title="Sitemap">
    {activeTab === 'sitemaps' && (
        <div className='pt-9 px-4 px-lg-7'>
            <Row>
                <Col xs={12} md={12} className="mx-auto">
                    <Card className="rounded-10 border border-gray-100 mb-4">
                        <Card.Body className="p-0">
                            <div className="d-flex align-items-center justify-content-between px-3 px-md-4 py-3 border-bottom border-gray-100 rounded-top">
                                <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Sitemap Overview</h3>
                                <div className="text-end">
            <button className="btn btn-primary btn-sm" size="md" onClick={() => fetchSitemapData(true)}>
                Fetch Sitemap
            </button>
        </div>
                            </div>
                        </Card.Body>
                        <Card.Body className="px-md-4 py-4">
                            <div className="px-md-3 py-md-3">
                                <div className="table-responsive">
                                    <Table hover size="md" className="list-table border-top-0">
                                        <tbody>
                                            <tr>
                                                <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Sitemap URL</td>
                                                <td className="d-block d-md-table-cell">
                                                    <a href={sitemapData?.site_urls} target="_blank" rel="noopener noreferrer" className="text-break">
                                                        {sitemapData?.site_urls}
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">Total Pages</td>
                                                <td className="d-block d-md-table-cell">{sitemapData?.total_pages}</td>
                                            </tr>
                                            {sitemapData?.contain_types?.map((typeInfo, index) => (
                                                <tr key={index}>
                                                    <td className="font-weight-semibold d-block d-md-table-cell border-0 border-md-bottom">{typeInfo.type}</td>
                                                    <td className="d-block d-md-table-cell">{typeInfo.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <Card className="rounded-10 border border-gray-100 mb-4">
                        <Card.Body className="p-0">
                            <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                                <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Sitemap</h3>
                            </div>
                        </Card.Body>
                        <div className="px-0 px-lg-4 px-xl-7">
                        <Card className="rounded-10 p-4 p-xl-6">
                            <Card.Body className="p-0 project-detail-table">
                            <DataTableWithPagination 
                                columns={sitemapColumns} 
                                data={sitemapFilteredData}
                                searchFilter={sitemapSearchFilter} 
                                setSearchFilter={setSitemapSearchFilter} 
                                pageNumber={sitemapPage} 
                                setPageNumber={setSitemapPage} 
                                perPageSize={sitemapPerPageSize} 
                                setPerPageSize={setSitemapPerPageSize} 
                                loading={sitemapTableLoader} 
                                totalPages={sitemapTotalPages} 
                                totalRecords={sitemapTotalRecords} 
                                sortby={sitemapSortBy} 
                                sortOrder={sitemapSortOrder} 
                                setSort={setSitemapSortOrder}
                                setSortingBy={setSitemapSortBy}
                            />

                            </Card.Body>
                        </Card>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )}
</Tab>
                                        </Tabs>
                                    </>
                                )}
                            </div>
                        </div>
                        <Footer />
                        </div>
                </>
            ) : (
                <NotFound />
            )}
        </>
    );
}  

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(ProjectDetail);
