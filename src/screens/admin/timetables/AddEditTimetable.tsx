import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Card, IconButton, Text } from "react-native-paper";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { useNavigation, useRoute } from "@react-navigation/native";

import SCDSelector from "../../../components/common/SCDSelector.native";

import { apiService } from "../../../api/apiService";
import { storage } from "../../../utils/storage";

const AddEditTimetable: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id: timetableId } = (route.params as any) || {};

  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<any>({
    id: null,
    schoolId: "",
    schoolName: "",
    classId: "",
    className: "",
    divisionId: "",
    divisionName: "",
    dayTimeTable: [],
    accountId: 0,
    createdBy: "",
    updatedBy: "",
    createdDate: null,
    updatedDate: null,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await storage.getItem("SCM-AUTH");
        const parsed = raw ? JSON.parse(raw) : null;
        const accountId = parsed?.data?.accountId ?? null;
        const userName =
          `${parsed?.data?.firstName || ""} ${
            parsed?.data?.lastName || ""
          }`.trim() ||
          parsed?.data?.userName ||
          "";

        if (mounted) {
          setInitialValues((prev: any) => ({
            ...prev,
            accountId: accountId || 0,
            createdBy: userName,
            updatedBy: userName,
          }));
        }

        if (timetableId) {
          setLoading(true);
          try {
            const resp = await apiService.api.get(
              `api/timetable/getById?id=${timetableId}`
            );
            const data = resp.data || {};
            if (mounted) {
              setInitialValues((prev: any) => ({
                ...prev,
                ...data,
                dayTimeTable: data.dayTimeTable || [],
                classId: data.classId ?? "",
                divisionId: data.divisionId ?? "",
                createdBy: data.createdBy || prev.createdBy,
                updatedBy: data.updatedBy || prev.updatedBy,
                createdDate: data.createdDate ?? prev.createdDate,
                updatedDate: data.updatedDate ?? prev.updatedDate,
              }));
            }
          } catch (err) {
            console.error("Failed to load timetable:", err);
            Alert.alert("Error", "Failed to load timetable");
          } finally {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Init error", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [timetableId]);

  const validationSchema = Yup.object().shape({
    schoolId: Yup.mixed().required("School is required"),
    classId: Yup.mixed().required("Class is required"),
    divisionId: Yup.mixed().required("Division is required"),
    dayTimeTable: Yup.array().of(
      Yup.object().shape({
        dayName: Yup.string().required("Day Name is required"),
        tsd: Yup.array().of(
          Yup.object().shape({
            type: Yup.string().required("Type is required"),
            subjectName: Yup.string().required("Subject is required"),
            hour: Yup.number().min(0).max(23).required("Hour required"),
            minute: Yup.number().min(0).max(59).required("Minute required"),
            subjectId: Yup.mixed().required("Subject required"),
            sequence: Yup.number().min(1).required("Sequence required"),
          })
        ),
      })
    ),
  });

  // subject/teacher picker state
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<any[]>([]);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [teacherOptions, setTeacherOptions] = useState<any[]>([]);
  // day picker state
  const [dayModalVisible, setDayModalVisible] = useState(false);
  // type picker state
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [pickerIndices, setPickerIndices] = useState<{
    dayIndex: number;
    slotIndex: number;
  } | null>(null);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const typeOptions = ["Lecture", "Lab", "Tutorial"];

  // preload subjects and teachers once accountId is known
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const accountId = initialValues?.accountId || 0;
        if (!accountId) return;
        const subs = await apiService.getSubjects(String(accountId));
        const t = await apiService.getTeachers(String(accountId));
        if (mounted) {
          setSubjectOptions(subs || []);
          setTeacherOptions(t || []);
        }
      } catch (err) {
        console.error("Failed to preload subjects/teachers", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialValues?.accountId]);

  const PickerModalLocal = ({
    visible,
    onClose,
    options,
    labelKey = "name",
    onSelect,
    selectedId,
  }: any) => {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              maxHeight: "70%",
            }}
          >
            <FlatList
              data={options || []}
              keyExtractor={(item, idx) =>
                String(item?.id ?? item?.value ?? idx)
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={{ color: "#111" }}>
                    {item?.[labelKey] ?? String(item)}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={{ padding: 16, alignItems: "center" }}>
                  <Text style={{ color: "#666" }}>No options</Text>
                </View>
              )}
            />
            <Button onPress={onClose}>Close</Button>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={timetableId ? "Edit Timetable" : "Add Timetable"} />
        <Card.Content>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const raw = await storage.getItem("SCM-AUTH");
                const parsed = raw ? JSON.parse(raw) : null;
                const accountId =
                  parsed?.data?.accountId ?? values.accountId ?? 0;
                const userName =
                  `${parsed?.data?.firstName || ""} ${
                    parsed?.data?.lastName || ""
                  }`.trim() ||
                  parsed?.data?.userName ||
                  "Unknown User";

                const finalValues = {
                  ...values,
                  id: values.id ? Number(values.id) : null,
                  accountId,
                  createdBy: timetableId ? values.createdBy : userName,
                  updatedBy: userName,
                  createdDate: timetableId
                    ? values.createdDate
                    : new Date().toISOString(),
                  updatedDate: new Date().toISOString(),
                  dayTimeTable: (values.dayTimeTable || []).map((day: any) => ({
                    ...day,
                    id: day.id ? Number(day.id) : null,
                    accountId,
                    dayName: day.dayName || "",
                    tsd: (day.tsd || []).map((slot: any) => ({
                      ...slot,
                      id: slot.id ? Number(slot.id) : null,
                      type: slot.type || "",
                      subjectName: slot.subjectName || "",
                      hour: Number(slot.hour) || 0,
                      minute: Number(slot.minute) || 0,
                      subjectId: Number(slot.subjectId) || 0,
                      teacherId: Number(slot.teacherId) || 0,
                      teacherName: slot.teacherName || userName,
                      sequence: Number(slot.sequence) || 0,
                      accountId,
                    })),
                  })),
                };

                setSubmitting(true);
                const endpoint = timetableId
                  ? `api/timetable/update/${timetableId}`
                  : `api/timetable/create`;
                const method = timetableId
                  ? apiService.api.put
                  : apiService.api.post;
                await method(endpoint, finalValues);

                Alert.alert(
                  "Success",
                  `Timetable ${timetableId ? "updated" : "saved"} successfully`,
                  [
                    {
                      text: "OK",
                      onPress: () => navigation.navigate("Timetables" as never),
                    },
                  ]
                );
              } catch (err) {
                console.error("Save timetable failed", err);
                Alert.alert("Error", "Failed to save timetable");
              } finally {
                setSubmitting(false as any);
              }
            }}
          >
            {({
              values,
              setFieldValue,
              handleSubmit,
              isSubmitting,
              touched,
              errors,
            }) => (
              <View>
                {/* SCD Selector (school/class/division) */}
                {SCDSelector && (
                  <SCDSelector
                    formik={{ values, setFieldValue, touched, errors }}
                  />
                )}

                {/* Days FieldArray */}
                <FieldArray name="dayTimeTable">
                  {({ push, remove }) => (
                    <View style={{ marginTop: 12 }}>
                      {Array.isArray(values.dayTimeTable) &&
                        values.dayTimeTable.map(
                          (day: any, dayIndex: number) => (
                            <Card key={dayIndex} style={styles.dayCard}>
                              <Card.Content>
                                <View style={styles.rowBetween}>
                                  <TouchableOpacity
                                    style={[styles.input, { justifyContent: 'center' }]}
                                    onPress={() => {
                                      setPickerIndices({ dayIndex, slotIndex: -1 });
                                      setDayModalVisible(true);
                                    }}
                                  >
                                    <Text style={{ color: day.dayName ? '#000' : '#888' }}>
                                      {day.dayName || 'Select day'}
                                    </Text>
                                  </TouchableOpacity>
                                  <IconButton
                                    icon="delete"
                                    onPress={() => remove(dayIndex)}
                                  />
                                </View>

                                {/* Time Slots */}
                                <FieldArray
                                  name={`dayTimeTable.${dayIndex}.tsd`}
                                >
                                  {({ push: pushTsd, remove: removeTsd }) => (
                                    <View>
                                      {(day.tsd || []).map(
                                        (slot: any, slotIndex: number) => (
                                          <Card
                                            key={slotIndex}
                                            style={styles.slotCard}
                                          >
                                            <Card.Content>
                                              <View style={styles.rowBetween}>
                                                <TouchableOpacity
                                                  style={[styles.input, { flex: 1, justifyContent: 'center' }]}
                                                  onPress={() => {
                                                    setPickerIndices({ dayIndex, slotIndex });
                                                    setTypeModalVisible(true);
                                                  }}
                                                >
                                                  <Text style={{ color: slot.type ? '#000' : '#888' }}>
                                                    {slot.type || 'Select type'}
                                                  </Text>
                                                </TouchableOpacity>
                                                <IconButton
                                                  icon="delete"
                                                  onPress={() => removeTsd(slotIndex)}
                                                />
                                              </View>

                                              <View style={styles.row}>
                                                <TouchableOpacity
                                                  style={[styles.input, { flex: 1, justifyContent: 'center' }]}
                                                  onPress={() => {
                                                    setPickerIndices({ dayIndex, slotIndex });
                                                    setSubjectModalVisible(true);
                                                  }}
                                                >
                                                  <Text style={{ color: slot.subjectName ? '#000' : '#888' }}>
                                                    {slot.subjectName || 'Select subject'}
                                                  </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                  style={[styles.input, { flex: 1, marginLeft: 8, justifyContent: 'center' }]}
                                                  onPress={() => {
                                                    setPickerIndices({ dayIndex, slotIndex });
                                                    setTeacherModalVisible(true);
                                                  }}
                                                >
                                                  <Text style={{ color: slot.teacherName ? '#000' : '#888' }}>
                                                    {slot.teacherName || 'Select teacher'}
                                                  </Text>
                                                </TouchableOpacity>
                                              </View>

                                              <View style={styles.row}>
                                                <TextInput
                                                  label="Hour"
                                                  value={String(slot.hour)}
                                                  keyboardType="numeric"
                                                  onChangeText={(text) =>
                                                    setFieldValue(
                                                      `dayTimeTable.${dayIndex}.tsd.${slotIndex}.hour`,
                                                      Number(text)
                                                    )
                                                  }
                                                  style={[
                                                    styles.input,
                                                    { width: 100 },
                                                  ]}
                                                />
                                                <TextInput
                                                  label="Minute"
                                                  value={String(slot.minute)}
                                                  keyboardType="numeric"
                                                  onChangeText={(text) =>
                                                    setFieldValue(
                                                      `dayTimeTable.${dayIndex}.tsd.${slotIndex}.minute`,
                                                      Number(text)
                                                    )
                                                  }
                                                  style={[
                                                    styles.input,
                                                    {
                                                      width: 100,
                                                      marginLeft: 8,
                                                    },
                                                  ]}
                                                />
                                                <TextInput
                                                  label="Sequence"
                                                  value={String(slot.sequence)}
                                                  keyboardType="numeric"
                                                  onChangeText={(text) =>
                                                    setFieldValue(
                                                      `dayTimeTable.${dayIndex}.tsd.${slotIndex}.sequence`,
                                                      Number(text)
                                                    )
                                                  }
                                                  style={[
                                                    styles.input,
                                                    {
                                                      width: 100,
                                                      marginLeft: 8,
                                                    },
                                                  ]}
                                                />
                                              </View>
                                            </Card.Content>
                                          </Card>
                                        )
                                      )}

                                      <Button
                                        mode="outlined"
                                        icon="plus"
                                        onPress={() =>
                                          pushTsd({
                                            id: 0,
                                            type: "",
                                            subjectName: "",
                                            hour: 0,
                                            minute: 0,
                                            subjectId: "",
                                            teacherId: "",
                                            teacherName: "",
                                            sequence:
                                              (day.tsd || []).length > 0
                                                ? Math.max(
                                                    ...(day.tsd || []).map(
                                                      (s: any) => s.sequence
                                                    )
                                                  ) + 1
                                                : 1,
                                            accountId: values.accountId || 0,
                                          })
                                        }
                                        style={{ marginTop: 8 }}
                                      >
                                        Add Time Slot
                                      </Button>
                                    </View>
                                  )}
                                </FieldArray>
                              </Card.Content>
                            </Card>
                          )
                        )}

                      <Button
                        mode="contained"
                        icon="plus"
                        onPress={() =>
                          push({
                            id: 0,
                            dayName: "",
                            tsd: [],
                            accountId: values.accountId || 0,
                          })
                        }
                        style={{ marginTop: 12 }}
                      >
                        Add Day
                      </Button>
                    </View>
                  )}
                </FieldArray>

                {/* Subject / Teacher pickers (local modals) */}
                <PickerModalLocal
                  visible={subjectModalVisible}
                  onClose={() => {
                    setSubjectModalVisible(false);
                    setPickerIndices(null);
                  }}
                  options={subjectOptions}
                  onSelect={(item: any) => {
                    if (pickerIndices) {
                      setFieldValue(
                        `dayTimeTable.${pickerIndices.dayIndex}.tsd.${pickerIndices.slotIndex}.subjectId`,
                        item?.id ?? item?.subjectId ?? item
                      );
                      setFieldValue(
                        `dayTimeTable.${pickerIndices.dayIndex}.tsd.${pickerIndices.slotIndex}.subjectName`,
                        item?.name ?? item?.subjectName ?? String(item)
                      );
                    }
                  }}
                />

                <PickerModalLocal
                  visible={teacherModalVisible}
                  onClose={() => {
                    setTeacherModalVisible(false);
                    setPickerIndices(null);
                  }}
                  options={teacherOptions}
                  labelKey="firstName"
                  onSelect={(item: any) => {
                    if (pickerIndices) {
                      const name =
                        (item?.firstName || "") + " " + (item?.lastName || "");
                      setFieldValue(
                        `dayTimeTable.${pickerIndices.dayIndex}.tsd.${pickerIndices.slotIndex}.teacherId`,
                        item?.id ?? item?.teacherId ?? item
                      );
                      setFieldValue(
                        `dayTimeTable.${pickerIndices.dayIndex}.tsd.${pickerIndices.slotIndex}.teacherName`,
                        name.trim() || item?.name || String(item)
                      );
                    }
                  }}
                />

                {/* Type picker (Lecture/Lab/Tutorial) */}
                <PickerModalLocal
                  visible={typeModalVisible}
                  onClose={() => {
                    setTypeModalVisible(false);
                    setPickerIndices(null);
                  }}
                  options={typeOptions}
                  onSelect={(item: any) => {
                    if (pickerIndices) {
                      setFieldValue(
                        `dayTimeTable.${pickerIndices.dayIndex}.tsd.${pickerIndices.slotIndex}.type`,
                        String(item)
                      );
                    }
                  }}
                />

                {/* Day picker (select from daysOfWeek) */}
                <PickerModalLocal
                  visible={dayModalVisible}
                  onClose={() => {
                    setDayModalVisible(false);
                    setPickerIndices(null);
                  }}
                  options={daysOfWeek}
                  onSelect={(item: any) => {
                    if (pickerIndices && pickerIndices.slotIndex === -1) {
                      setFieldValue(
                        `dayTimeTable.${pickerIndices.dayIndex}.dayName`,
                        String(item)
                      );
                    }
                  }}
                />

                <View style={{ marginTop: 16 }}>
                  <Button
                    mode="contained"
                    onPress={() => handleSubmit()}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {timetableId ? "Update Timetable" : "Save Timetable"}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: 8 }}
                  >
                    Cancel
                  </Button>
                </View>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12 },
  card: { marginBottom: 12 },
  input: { marginBottom: 8, backgroundColor: "#fff" },
  dayCard: { marginBottom: 12, backgroundColor: "#fafafa" },
  slotCard: { marginTop: 8, backgroundColor: "#fff" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
});

export default AddEditTimetable;
