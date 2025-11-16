import React from 'react';
import { ReusableForm, FormField } from '../../../components/common/ReusableForm';

const classFormFields: FormField[] = [
  { name: 'name', label: 'Class Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: false, multiline: true },
  { name: 'capacity', label: 'Capacity', type: 'number', required: false },
];

const transformClassData = (data: any, isUpdate: boolean) => {
  return {
    ...data,
    capacity: data.capacity ? parseInt(data.capacity, 10) : null,
  };
};

export const AddEditClass: React.FC = () => {
  return (
    <ReusableForm
      entityName="Class"
      fields={classFormFields}
      fetchUrl="/api/schoolClasses"
      saveUrl="/api/schoolClasses/save"
      updateUrl="/api/schoolClasses/update"
      transformForSubmit={transformClassData}
      onSuccessUrl="Classes"
      showSCDSelector={true}
    />
  );
};

export default AddEditClass;
