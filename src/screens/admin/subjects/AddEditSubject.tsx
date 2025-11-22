import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";

import {
  ReusableForm,
  FormField,
} from "../../../components/common/ReusableForm";
import { apiService } from "../../../api/apiService";

const AddEditSubject: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id: subjectId } = (route.params as any) || {};
  const { t } = useTranslation("edit");

  const [initialValues, setInitialValues] = useState<any>({
    id: null,
    name: "",
    subjectCode: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (subjectId) {
        try {
          const resp = await apiService.api.get(
            `api/subjects/getById?id=${subjectId}`
          );
          const data = resp?.data || {};
          if (mounted) {
            setInitialValues({
              id: data.id ?? subjectId,
              name: data.name ?? "",
              subjectCode: data.subjectCode ?? "",
            });
          }
        } catch (err) {
          console.error("Failed to load subject:", err);
          Alert.alert(
            t("subject.messages.fetchFailed") || "Failed to load subject"
          );
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [subjectId, t]);

  const fields: FormField[] = [
    {
      name: "name",
      label: t("subject.fields.name") || "Subject Name",
      required: true,
    },
    {
      name: "subjectCode",
      label: t("subject.fields.subjectCode") || "Subject Code",
      required: true,
    }
   
  ];

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .max(255)
      .required(t("common.required") || "This field is required"),
    subjectCode: Yup.string()
      .max(255)
      .required(t("common.required") || "This field is required"),
  });

  const handleSubmit = async (values: any, formikHelpers: any) => {
    // Perform save and let ReusableForm show success/failure messages and handle navigation.
    const payload = { ...values };
    console.log("Submitting subject payload:", payload);
    if (values?.id) {
      await apiService.api.put("api/subjects/update", payload);
      return;
    }
    await apiService.api.post("api/subjects/save", payload);
    return;
  };

  return (
    <View style={styles.container}>
      <ReusableForm
        initialValues={initialValues}
        validationSchema={validationSchema}
        // onSubmit={handleSubmit}
        saveUrl="api/subjects/save"
        updateUrl="api/subjects/update"
        onSuccessRoute={{ name: "MainDrawer", params: { screen: "SUBJECT" } }}
        fields={fields}
        isEditMode={!!subjectId}
        cancelAction={() => {
          if (
            (navigation as any).canGoBack &&
            (navigation as any).canGoBack()
          ) {
            (navigation as any).goBack();
          } else {
            (navigation as any).navigate("MainDrawer", { screen: "SUBJECT" });
          }
        }}
        disableSCD={true}
        entityName="Subject"
        submitLabel={
          subjectId
            ? t("subject.messages.updateLabel") || "Update"
            : t("subject.messages.saveLabel") || "Save"
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

export default AddEditSubject;
