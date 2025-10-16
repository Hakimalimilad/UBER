import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  Mail,
  Calendar,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit,
  MapPin,
  Phone,
  School,
  Loader2
} from 'lucide-react';
import api from '../../lib/api';

// Simple loading component
const EthiraGlobalLoader = ({ size = 'md', message = 'Loading...' }: { size?: string; message?: string }) => (
  <div className="flex flex-col items-center justify-center">
    <Loader2 className={`animate-spin ${size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'} text-indigo-600`} />
    <p className="mt-2 text-sm text-gray-600">{message}</p>
  </div>
);

const getEthicalLoadingMessage = (context: string) => `Loading ${context} data...`;

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  student_id: string;
  pickup_location: string;
  dropoff_location: string;
  parent_name: string;
  parent_phone: string;
  emergency_contact: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
  rides_count: number;
}

interface Statistics {
  total_students: number;
  active_students: number;
  inactive_students: number;
  verified_students: number;
}

const AdminStudentsPage = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total_students: 0,
    active_students: 0,
    inactive_students: 0,
    verified_students: 0
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/all-students');
      setStudents(response.data.students || []);
      setStatistics(response.data.statistics || {
        total_students: 0,
        active_students: 0,
        inactive_students: 0,
        verified_students: 0
      });
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
      if (error.response?.status === 401) {
        setMessage('Please log in to access admin features');
        setMessageType('error');
        router.push('/login');
      } else {
        setMessage('Failed to load students');
        setMessageType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (student: Student) => {
    if (!student.is_verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Unverified
        </span>
      );
    } else if (!student.is_active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Inactive
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleActivateStudent = async (studentId: number) => {
    try {
      const response = await api.post(`/admin/activate-student/${studentId}`, {});
      if (response.status === 200) {
        setStudents(students.map(student => 
          student.id === studentId ? { ...student, is_active: true } : student
        ));
        setSelectedStudent(prev => prev ? { ...prev, is_active: true } : null);
        setMessage('Student reactivated successfully!');
        setMessageType('success');
      }
    } catch (error: any) {
      console.error('Error reactivating student:', error);
      setMessage(error.response?.data?.error || 'Failed to reactivate student');
      setMessageType('error');
    }
  };

  const handleDeleteStudent = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const response = await api.delete(`/admin/delete-student/${studentToDelete.id}`);
      if (response.status === 200) {
        setStudents(students.filter(s => s.id !== studentToDelete.id));
        setSelectedStudent(null);
        setMessage(`Student ${studentToDelete.name} has been deleted.`);
        setMessageType('success');
      }
    } catch (error: any) {
      console.error('Error deleting student:', error);
      setMessage(error.response?.data?.error || 'Failed to delete student');
      setMessageType('error');
    } finally {
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-none sm:max-w-7xl sm:mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage student accounts and transport information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-md p-4 ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                messageType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total_students}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.active_students}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Students</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.inactive_students}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified Students</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.verified_students}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Students</h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete list of registered students with transport details
          </p>
        </div>

        <div className="overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <EthiraGlobalLoader size="lg" message={getEthicalLoadingMessage('admin')} />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No students have registered yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transport Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-800">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email}</div>
                        <div className="text-sm text-gray-500">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            Pickup: {student.pickup_location}
                          </div>
                          <div className="flex items-center mt-1">
                            <School className="h-4 w-4 text-gray-400 mr-1" />
                            Dropoff: {student.dropoff_location}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Rides: {student.rides_count}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(student)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => viewStudentDetails(student)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setShowStudentModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Student ID</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.student_id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Pickup Location</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.pickup_location}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Dropoff Location</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.dropoff_location}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Parent Name</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.parent_name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Parent Phone</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.parent_phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Emergency Contact</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.emergency_contact}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Rides Count</label>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.rides_count}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Registration Date</label>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedStudent.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Last Login</label>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedStudent.last_login)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900">Delete Student</h3>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to delete {studentToDelete.name}? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3 p-5 border-t">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStudent}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsPage;
