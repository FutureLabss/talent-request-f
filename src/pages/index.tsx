// pages/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Nav from "@/components/Nav";
import { FiRefreshCw } from "react-icons/fi";
import RecruiterTable from "@/components/RecruiterTable";
import JobSeekerTable from "@/components/JobSeekerTable";
import SubmissionDetailModal from "@/components/SubmissionDetailModal";

// Interface for Recruiter Requests - (Keep this as it is)
interface TalentRequest {
  _id: string;
  firstName: string;
  lastName: string;
  companyEmail: string;
  companyWebsite: string;
  professionNeeded: string;
  quantityNeeded: number;
  contactAddress: string;
  createdAt: string;
  type: "recruiter"; // Explicitly define type for clarity
}

// Interface for Job Applications - UPDATED TO MATCH BACKEND RESPONSE AND OTHER COMPONENTS
interface JobApplication {
  _id: string;
  fullName: string; // Changed from firstName, lastName
  email: string;
  phoneNumber: string;
  desiredRole: string; // Changed from profession
  experience: number; // Changed from yearsOfExperience
  portfolio?: string; // Changed from portfolioWebsite, now optional
  resume: string; // Changed from cvPath
  coverLetter?: string; // New field, optional
  createdAt: string;
  type: "job_seeker"; // Explicitly define type for clarity
}

// Union type for requests to handle both in state and modal
type Submission = TalentRequest | JobApplication;

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Separate states for different types of submissions
  const [recruiterRequests, setRecruiterRequests] = useState<TalentRequest[]>(
    []
  );
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);

  // Separate loading states for each type to allow independent loading indicators
  const [recruiterLoading, setRecruiterLoading] = useState(true);
  const [jobSeekerLoading, setJobSeekerLoading] = useState(true);

  // State to manage active tab: 'recruiter' or 'job_seeker'
  const [activeTab, setActiveTab] = useState<"recruiter" | "job_seeker">(
    "recruiter"
  );

  // State for modal
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const decodeToken = (jwtToken: string) => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      if (!jwtToken) {
        return null;
      }
      const parts = jwtToken.split(".");
      if (parts.length !== 3) {
        return null;
      }
      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (e) {
      console.error("Error decoding JWT token:", e, "Token:", jwtToken);
      return null;
    }
  };

  // --- Authentication and Redirection Logic ---
  useEffect(() => {
    setAuthLoading(true);
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const decodedUser = decodeToken(storedToken);
        if (decodedUser && decodedUser.role === "admin") {
          setToken(storedToken);
          setUser({
            id: decodedUser.id,
            email: decodedUser.email,
            role: decodedUser.role,
          });
          setAuthLoading(false);
          return;
        } else {
          console.warn(
            "Invalid token or non-admin user. Clearing and redirecting."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
    setAuthLoading(false);
    router.push("/login");
  }, [router]);

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  };

  // Fetch data for recruiter requests
  const fetchRecruiterRequests = async () => {
    if (!token || authLoading) {
      setRecruiterLoading(false);
      return;
    }
    setRecruiterLoading(true);
    try {
      const response = await fetch(
        "https://talent-backend-o5cb.onrender.com/api/talents/recruiter",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error(
            "Unauthorized or Forbidden access to recruiter requests. Logging out."
          );
          logout();
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: TalentRequest[] = await response.json();
      setRecruiterRequests(data);
    } catch (error) {
      console.error("Error fetching recruiter requests:", error);
      setRecruiterRequests([]); // Clear data on error
    } finally {
      setRecruiterLoading(false);
    }
  };

  // Fetch data for job applications
  const fetchJobApplications = async () => {
    if (!token || authLoading) {
      setJobSeekerLoading(false);
      return;
    }
    setJobSeekerLoading(true);
    try {
      const response = await fetch(
        "https://talent-backend-o5cb.onrender.com/api/talents/job-seeker",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error(
            "Unauthorized or Forbidden access to job applications. Logging out."
          );
          logout();
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: JobApplication[] = await response.json();
      setJobApplications(data);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      setJobApplications([]); // Clear data on error
    } finally {
      setJobSeekerLoading(false);
    }
  };

  // Effect to fetch data when token or activeTab changes
  useEffect(() => {
    if (!authLoading && token) {
      if (activeTab === "recruiter") {
        fetchRecruiterRequests();
      } else {
        fetchJobApplications();
      }
    }
  }, [token, authLoading, activeTab]); // Include activeTab as a dependency

  // Handle opening the modal (passed to child components)
  const openModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return null; // or a loading spinner/redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Nav />
      </div>
      <div className="max-w-7xl mx-auto mt-10">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        {user && (
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-semibold">{user.email}</span>!
            Your role:{" "}
            <span className="font-semibold text-blue-600">{user.role}</span>
          </p>
        )}
        <p className="text-gray-600 mt-2">
          Manage talent requests and submissions.
        </p>
      </div>
      <div className="max-w-7xl mx-auto mt-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                if (activeTab === "recruiter") {
                  fetchRecruiterRequests();
                } else {
                  fetchJobApplications();
                }
              }}
              className="flex items-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw
                className={`mr-2 ${
                  (recruiterLoading && activeTab === "recruiter") ||
                  (jobSeekerLoading && activeTab === "job_seeker")
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation for Requests/Applications */}
        <div className="mb-6 flex border-b border-gray-200">
          <button
            className={`py-3 px-6 text-sm font-medium transition-colors cursor-pointer duration-200 ${
              activeTab === "recruiter"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("recruiter")}
          >
            Recruiter Requests
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium transition-colors cursor-pointer duration-200 ${
              activeTab === "job_seeker"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("job_seeker")}
          >
            Job Seeker Applications
          </button>
        </div>

        {/* Render tables conditionally based on activeTab */}
        {activeTab === "recruiter" ? (
          <RecruiterTable
            requests={recruiterRequests}
            onViewDetails={openModal}
            isLoading={recruiterLoading}
          />
        ) : (
          <JobSeekerTable
            applications={jobApplications}
            onViewDetails={openModal}
            isLoading={jobSeekerLoading}
          />
        )}
      </div>

      {/* Submission Detail Modal (Dynamically Rendered) */}
      {isModalOpen && selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
