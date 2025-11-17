import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";

import { ReusableForm, FormField } from "../../../components/common/ReusableForm";
import { apiService } from "../../../api/apiService";
import { userDetails } from "../../../utils/apiService";

const AddEditDivision: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id: divisionId } = (route.params as any) || {};
  const { t } = useTranslation("edit");

  const [initialValues, setInitialValues] = useState<any>({
    id: null,
    name: "",
    subjectCode: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (divisionId) {
        try {
          const resp = await apiService.api.get(
            `api/divisions/getById?id=${divisionId}`
          );
          const data = resp?.data || {};
          if (mounted) {
            setInitialValues({
              id: data.id ?? divisionId,
              name: data.name ?? "",
              subjectCode: data.subjectCode ?? "",
            });
          }
        } catch (err) {
          console.error("Failed to load division:", err);
          Alert.alert(t("division.messages.fetchFailed") || "Failed to load division");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [divisionId, t]);

  const fields: FormField[] = [
    { name: "name", label: t("division.fields.name") || "Division Name", required: true },
    { name: "subjectCode", label: t("division.fields.code") || "Division Code" },
  ];

  const validationSchema = Yup.object().shape({
    name: Yup.string().max(255).required(t("common.required") || "This field is required"),
  });

  const handleSubmit = async (values: any, formikHelpers: any) => {
    formikHelpers.setSubmitting(true);
    try {
      const accountId = await userDetails.getAccountId();
      const payload = { ...values, accountId };
      console.log("Submitting division payload:", payload);
      if (values?.id) {
        await apiService.api.put("api/divisions/update", payload);
        Alert.alert(t("division.messages.saved") || "Division updated");
      } else {
        await apiService.api.post("api/divisions/save", payload);
        Alert.alert(t("division.messages.saved") || "Division created");
      }

      if ((navigation as any).canGoBack && (navigation as any).canGoBack()) {
        (navigation as any).goBack();
      } else {
        navigation.navigate("DivisionsList" as never);
      }
    } catch (err) {
      console.error("Save division failed", err);
      Alert.alert(
        t("division.messages.saveFailed") || "Failed to save division"
      );
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ReusableForm 
      
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        fields={fields}
        isEditMode={!!divisionId}
        cancelAction={() => {
          if ((navigation as any).canGoBack && (navigation as any).canGoBack()) {
            (navigation as any).goBack();
          } else {
            navigation.navigate("DivisionsList" as never);
          }
        }}
        disableSCD={true}
        entityName="Division"
        submitLabel={divisionId ? t("division.messages.updateLabel") || "Update" : t("division.messages.saveLabel") || "Save"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

export default AddEditDivision;
