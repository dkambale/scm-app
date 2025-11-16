import React from 'react';
import { ReusableForm, FormField } from '../../../components/common/ReusableForm';

const instituteFormFields: FormField[] = [
  { name: 'name', label: 'Institute Name', type: 'text', required: true },
  { name: 'address', label: 'Address', type: 'textarea', required: true, multiline: true },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'state', label: 'State', type: 'text', required: true },
  { name: 'pincode', label: 'Pincode', type: 'text', required: true },
  { name: 'contactNumber', label: 'Contact Number', type: 'tel', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'type', label: 'Type', type: 'text', required: false },
];

const transformInstituteData = (data: any, isUpdate: boolean) => {
  return {
    ...data,
  };
};

export const AddEditInstitute: React.FC = () => {
  return (
    <ReusableForm
      entityName="Institute"
      fields={instituteFormFields}
      fetchUrl="/api/institutes"
      saveUrl="/api/institutes/save"
      updateUrl="/api/institutes/update"
      transformForSubmit={transformInstituteData}
      onSuccessUrl="Institutes"
      showSCDSelector={false}
    />
  );
};

export default AddEditInstitute;
