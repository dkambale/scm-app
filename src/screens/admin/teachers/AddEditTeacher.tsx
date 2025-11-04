import React from 'react';
import { ReusableForm, FormField } from '../../../components/common/ReusableForm';

const teacherFormFields: FormField[] = [
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'lastName', label: 'Last Name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'mobile', label: 'Mobile', required: true },
  { name: 'subject', label: 'Subject', required: true },
];

export const AddEditTeacher: React.FC = () => {
  return (
    <ReusableForm
      entityName="Teacher"
      fields={teacherFormFields}
      fetchUrl="/api/users/getById"
      saveUrl="/api/users/save"
      updateUrl="/api/users/update"
      onSuccessUrl="TeacherList"
    />
  );
};
