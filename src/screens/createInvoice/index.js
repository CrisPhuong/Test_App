import { loginFailure } from "actions/auth";
import { createInvoicesHandler } from "actions/listInvoices";
import CustomButton from "components/CustomButton";
import CustomInput from "components/CustomInput";
import { FONT_FAMILY, FONT_SIZE, LINE_HEIGHT } from "constants/appFonts";
import { CUSTOM_COLOR } from "constants/colors";
import { SIZE } from "constants/size";
import moment from "moment";
import React, { useCallback, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { useDispatch, useSelector } from "react-redux";
import { useFormInput } from "src/hooks/useFormInput";

const STATUS_TOKEN_EXPIRED = 401;
const CREATE_INVOICES_FAIL = 400;

const HomeScreen = (props) => {
  const { navigation } = props || {};
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const referenceInput = useFormInput("");
  const descriptionInput = useFormInput("");
  const quantityInput = useFormInput("");
  const [dateTime, setDateTime] = useState(new Date());

  const [open, setOpen] = useState(false);

  const onCreate = useCallback(() => {
    dispatch(
      createInvoicesHandler({
        params: {
          invoices: [
            {
              bankAccount: {
                bankId: "",
                sortCode: "09-01-01",
                accountNumber: "12345678",
                accountName: "John Terry",
              },
              customer: {
                firstName: "Nguyen",
                lastName: "Dung 2",
                contact: {
                  email: "nguyendung2@101digital.io",
                  mobileNumber: "+6597594971",
                },
                addresses: [
                  {
                    premise: "CT11",
                    countryCode: "VN",
                    postcode: "1000",
                    county: "hoangmai",
                    city: "hanoi",
                  },
                ],
              },
              documents: [
                {
                  documentId: "96ea7d60-89ed-4c3b-811c-d2c61f5feab2",
                  documentName: "Bill",
                  documentUrl: "http://url.com/#123",
                },
              ],
              invoiceReference: referenceInput?.value,
              invoiceNumber: referenceInput?.value,
              currency: "GBP",
              invoiceDate:
                moment(dateTime).format("YYYY-MM-DD") || "2021-05-27",
              dueDate: "2021-06-04",
              description: descriptionInput?.value,
              customFields: [
                {
                  key: "invoiceCustomField",
                  value: "value",
                },
              ],
              extensions: [
                {
                  addDeduct: "ADD",
                  value: 10,
                  type: "PERCENTAGE",
                  name: "tax",
                },
                {
                  addDeduct: "DEDUCT",
                  type: "FIXED_VALUE",
                  value: 10.0,
                  name: "discount",
                },
              ],
              items: [
                {
                  itemReference: "itemRef",
                  description: "Honda RC150",
                  quantity: quantityInput?.value,
                  rate: 1,
                  itemName: "Honda Motor",
                  itemUOM: "KG",
                  customFields: [
                    {
                      key: "taxiationAndDiscounts_Name",
                      value: "VAT",
                    },
                  ],
                  extensions: [
                    {
                      addDeduct: "ADD",
                      value: 10,
                      type: "FIXED_VALUE",
                      name: "tax",
                    },
                    {
                      addDeduct: "DEDUCT",
                      value: 10,
                      type: "PERCENTAGE",
                      name: "tax",
                    },
                  ],
                },
              ],
            },
          ],
          operation_Mode: "SYNC",
          org_token: userInfo?.data?.memberships?.[0]?.token,
        },
        success: () => {
          navigation.reset({
            routes: [
              {
                name: "ListInvoicesScreen",
              },
            ],
          });
          alert("Create Invoices Success");
        },
        failure: (res) => {
          if (res?.status == STATUS_TOKEN_EXPIRED) {
            Alert.alert("Create InVoices", "Token expired Pls login again", [
              {
                text: "OK",
                onPress: () => {
                  dispatch(loginFailure({ isExpired: true }));
                },
              },
            ]);
          }
          if (res?.status == CREATE_INVOICES_FAIL) {
            Alert.alert(
              "Create InVoices",
              "Create Invoices Fail Pls Create Again ",
              [
                {
                  text: "OK",
                  onPress: () => {},
                },
              ]
            );
          }
        },
      })
    );
  }, [
    quantityInput?.value,
    descriptionInput?.value,
    dispatch,
    referenceInput?.value,
    userInfo?.data?.memberships,
    dateTime,
  ]);

  const openDateTimePicker = () => {
    setOpen(true);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <Text style={styles.screenTitle}>{"Create Invoice"}</Text>
      </SafeAreaView>
      <CustomInput
        multiple
        label={"Reference"}
        placeholder={"Reference"}
        style={styles.inputContainer}
        customInputContainerStyle={styles.questionInput}
        {...referenceInput}
      />
      <View>
        <TouchableOpacity
          style={styles.buttonSelectDate}
          onPress={openDateTimePicker}
        >
          <Text>SelectDate</Text>
        </TouchableOpacity>
        <View style={styles.containerDate}>
          <Text style={styles.labelDate}>
            Date: {moment(dateTime).format("YYYY-MM-DD")}
          </Text>
        </View>
      </View>
      <CustomInput
        multiple
        label={"Description"}
        placeholder={"Description"}
        style={styles.inputContainer}
        customInputContainerStyle={styles.questionInput}
        {...descriptionInput}
      />
      <CustomInput
        multiple
        label={"Quantity"}
        placeholder={"Quantity"}
        style={styles.inputContainer}
        customInputContainerStyle={styles.questionInput}
        {...quantityInput}
        keyboardType="numeric"
      />
      <CustomButton
        style={styles.containerButton}
        title={"Create Invoices"}
        onPress={onCreate}
        titleStyle={styles.createButton}
      />
      <DatePicker
        modal
        mode={"date"}
        open={open}
        date={dateTime}
        onConfirm={(date) => {
          setOpen(false);
          setDateTime(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CUSTOM_COLOR.White,
  },
  headerContainer: {
    paddingHorizontal: SIZE.Size16,
    justifyContent: "space-between",
    backgroundColor: CUSTOM_COLOR.white,
  },
  screenTitle: {
    fontSize: FONT_SIZE.Size36,
    lineHeight: LINE_HEIGHT.Size36,
    fontFamily: FONT_FAMILY.Medium,
    color: CUSTOM_COLOR.Green06,
    marginHorizontal: SIZE.Size16,
  },
  createButton: {
    fontSize: 20,
    padding: 10,
  },
  containerButton: {
    marginTop: 30,
    borderWidth: 1,
    marginHorizontal: 40,
  },
  containerDate: {
    height: 60,
    justifyContent: "center",
    paddingLeft: 16,
    backgroundColor: CUSTOM_COLOR.Navy07,
    borderRadius: 8,
  },
  labelDate: {
    color: "white",
  },
  buttonSelectDate: {
    marginVertical: 20,
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 6,
    marginHorizontal: 80,
    borderRadius: 8,
  },
});
