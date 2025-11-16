import React from 'react';
import { ReusableForm, FormField } from '../../../components/common/ReusableForm';

const divisionFormFields: FormField[] = [
  { name: 'name', label: 'Division Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: false, multiline: true },
  { name: 'capacity', label: 'Capacity', type: 'number', required: false },
];

const transformDivisionData = (data: any, isUpdate: boolean) => {
  return {
    ...data,
    capacity: data.capacity ? parseInt(data.capacity, 10) : null,
  };
};

export const AddEditDivision: React.FC = () => {
  return (
    <ReusableForm
      entityName="Division"
      fields={divisionFormFields}
      fetchUrl="/api/divisions"
      saveUrl="/api/divisions/save"
      updateUrl="/api/divisions/update"
      transformForSubmit={transformDivisionData}
      onSuccessUrl="Divisions"
      showSCDSelector={true}
    />
  );
};

export default AddEditDivision;
