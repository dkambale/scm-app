import React from 'react';
import { ReusableForm, FormField } from '../../../components/common/ReusableForm';

const schoolFormFields: FormField[] = [
  { name: 'name', label: 'School Name', type: 'text', required: true },
  { name: 'address', label: 'Address', type: 'textarea', required: true, multiline: true },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'state', label: 'State', type: 'text', required: true },
  { name: 'pincode', label: 'Pincode', type: 'text', required: true },
  { name: 'contactNumber', label: 'Contact Number', type: 'tel', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
];

const transformSchoolData = (data: any, isUpdate: boolean) => {
  return {
    ...data,
  };
};

export const AddEditSchool: React.FC = () => {
  return (
    <ReusableForm
      entityName="School"
      fields={schoolFormFields}
      fetchUrl="/api/schoolBranches"
      saveUrl="/api/schoolBranches/save"
      updateUrl="/api/schoolBranches/update"
      transformForSubmit={transformSchoolData}
      onSuccessUrl="Schools"
      showSCDSelector={false}
    />
  );
};

export default AddEditSchool;
