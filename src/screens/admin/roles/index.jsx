import React from 'react';
import { useNavigate } from 'react-router-dom';

// project imports
import ReusableDataGrid from 'ui-component/ReusableDataGrid';
import { userDetails } from '../../../utils/apiService';

// Define the columns for roles
const columnsConfig = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Role Name', flex: 1 },
  { field: 'description', headerName: 'Description', flex: 1 },
  { field: 'isActive', headerName: 'Status', width: 120 },
  { field: 'createdAt', headerName: 'Created Date', width: 150 }
];

// ==============================|| ROLES LIST PAGE ||============================== //

const Roles = () => {
  const navigate = useNavigate();
  const accountId = userDetails.getAccountId();

  // Custom actions for roles
  const customActions = [
    {
      icon: <span>👁️</span>,
      label: 'View Role',
      tooltip: 'View role details',
      color: 'info',
      onClick: (row) => {
        navigate(`/masters/roles/view/${row.id}`);
      }
    },
    {
      icon: <span>📝</span>,
      label: 'Edit Role',
      tooltip: 'Edit role details',
      color: 'primary',
      onClick: (row) => {
        navigate(`/masters/roles/edit/${row.id}`);
      }
    },
    {
      icon: <span>🔐</span>,
      label: 'Manage Permissions',
      tooltip: 'Manage role permissions',
      color: 'secondary',
      onClick: (row) => {
        navigate(`/masters/roles/permissions/${row.id}`);
      }
    }
  ];

  // Data transformation function
  const transformRoleData = (role) => ({
    ...role,
    isActive: role.isActive ? 'Active' : 'Inactive',
    createdAt: role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'
  });

  return (
    <ReusableDataGrid
      title="Roles Management"
      fetchUrl={`/api/roles/getAll/${accountId}`}
      columns={columnsConfig}
      editUrl="/masters/roles/edit"
      deleteUrl="/api/roles/delete"
      addActionUrl="/masters/roles/add"
      viewUrl="/masters/roles/view"
      entityName="ROLE"
      isPostRequest={true}
      customActions={customActions}
      searchPlaceholder="Search roles by name or description..."
      showSearch={true}
      showRefresh={true}
      showFilters={true}
      pageSizeOptions={[5, 10, 25, 50]}
      defaultPageSize={10}
      height={600}
      transformData={transformRoleData}
      // Enable filters for roles (school only)
      enableFilters={true}
      showSchoolFilter={true}
      showClassFilter={false}
      showDivisionFilter={false}
      customToolbar={() => (
        <div style={{ marginBottom: '16px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <strong>Roles Overview:</strong> Manage all roles with search, pagination, and comprehensive action capabilities.
          <br />
          <small>Use the school filter above to narrow down roles by school.</small>
        </div>
      )}
    />
  );
};

export default Roles;
