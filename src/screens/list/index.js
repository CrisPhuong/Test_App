import { getUserProfileHandle, loginFailure } from "actions/auth";
import { getListInvoicesHandler } from "actions/listInvoices";
import CustomInput from "components/CustomInput";
import { FONT_FAMILY, FONT_SIZE, LINE_HEIGHT } from "constants/appFonts";
import { CUSTOM_COLOR } from "constants/colors";
import { SIZE } from "constants/size";
import React, {
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  RefreshControl,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFormInput } from "src/hooks/useFormInput";
import InvoicesItem from "./components/InvoicesItem";

const ListInvoices = (props) => {
  const { navigation } = props;

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [dataListInvoices, setDataListInvoices] = useState([]);
  const [totalRecords, setTotalRecords] = useState(null);
  const [pageNumber, setPageNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const refInput = useRef({ timeout: 0 });
  const searchInput = useFormInput("");
  const [dataSearch, setDataSearch] = useState([]);
  useLayoutEffect(() => {
    dispatch(
      getUserProfileHandle({
        success: () => {},
        failure: () => {
          dispatch(loginFailure({ isExpired: true }));
        },
      })
    );
  }, []);

  useEffect(() => {
    if (!!userInfo?.data?.memberships?.[0]?.token) {
      getListDataInvoices();
    }
  }, [userInfo?.data?.memberships?.[0]?.token]);

  const getListDataInvoices = React.useCallback(
    (pageNum = 1, pageSize = 20, filterType = "CREATED_DATE") => {
      dispatch(
        getListInvoicesHandler({
          params: {
            pageNum: pageNum,
            pageSize: pageSize,
            dateType: "INVOICE_DATE",
            sortBy: filterType,
            ordering: "DESCENDING",
            org_token: userInfo?.data?.memberships?.[0]?.token,
          },
          success: (res) => {
            setDataListInvoices(res?.data);
            setTotalRecords(res?.paging?.totalRecords);
            setPageNumber(res?.paging?.pageNumber);
            setIsLoading(false);
          },
          failure: () => {
            setIsLoading(false);
            dispatch(loginFailure({ isExpired: true }));
          },
        })
      );
    },
    [dispatch, userInfo?.data?.memberships?.[0]?.token]
  );

  const handelLoadMore = useCallback(() => {
    if (
      !isLoading &&
      dataListInvoices &&
      dataListInvoices?.length < totalRecords
    ) {
      dispatch(
        getListInvoicesHandler({
          params: {
            pageNum: pageNumber + 1,
            pageSize: 20,
            dateType: "INVOICE_DATE",
            sortBy: "CREATED_DATE",
            ordering: "DESCENDING",
            org_token: userInfo?.data?.memberships?.[0]?.token,
          },
          success: (res) => {
            setDataListInvoices(dataListInvoices?.concat(res?.data));
            setTotalRecords(res?.paging?.totalRecords);
            setPageNumber(res?.paging?.pageNumber);
          },
          failure: () => {
            Alert.alert("An error has occurred");
          },
        })
      );
    }
  }, [pageNumber, isLoading, dataListInvoices, totalRecords]);

  //Instead of using lodash debounce to search on smooth more, I use ref so it's still smooth and lighter
  const handleSearch = useCallback(
    (text) => {
      clearTimeout(refInput.current.timeout);
      searchInput.onChangeText(text);
      refInput.current.timeout = setTimeout(() => {
        handleSearchData(text);
      }, 1000);
    },
    [refInput, searchInput]
  );

  const handleSearchData = useCallback(
    (text) => {
      setDataSearch(
        dataListInvoices.filter((ele) => ele?.description.includes(text))
      );
    },
    [dataListInvoices]
  );

  const handelSortByAmount = useCallback(
    (type) => {
      switch (type) {
        case "ASCENDING":
          const arraySort = dataListInvoices.sort((a, b) => {
            return a?.totalAmount - b?.totalAmount;
          });
          return setDataListInvoices([...arraySort]);

        default:
          const temptData = dataListInvoices.sort((a, b) => {
            return b?.totalAmount - a?.totalAmount;
          });
          return setDataListInvoices([...temptData]);
      }
    },
    [dataListInvoices, searchInput?.value, dataSearch]
  );

  const handelSortByCreateAt = useCallback(
    (type) => {
      switch (type) {
        case "CREATED_DATE":
          setIsLoading(true);
          getListDataInvoices(
            (pageNum = ""),
            (pageSize = ""),
            (filterType = "CREATED_DATE")
          );
          break;

        default:
          setIsLoading(true);
          getListDataInvoices(
            (pageNum = ""),
            (pageSize = ""),
            (filterType = "INVOICE_DATE")
          );
          break;
      }
    },
    [dataListInvoices, searchInput?.value, dataSearch]
  );

  const renderItem = ({ item }) => {
    return <InvoicesItem data={item} navigation={navigation} />;
  };

  const renderEmptyComponent = useCallback(() => {
    return (
      <View style={styles.containerEmptyComponent}>
        {isLoading ? (
          <ActivityIndicator
            style={{ paddingTop: 100 }}
            size="large"
            color="#0000ff"
          />
        ) : (
          <Text>Empty Data</Text>
        )}
      </View>
    );
  }, [isLoading]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenName}>List Invoices</Text>
      <View style={styles.groupButton}>
        <TouchableOpacity
          style={styles.buttonSort}
          onPress={() => handelSortByAmount("ASCENDING")}
        >
          <Text style={styles.labelButton}>Sort Ascending Amount</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonSort}
          onPress={() => handelSortByAmount("")}
        >
          <Text style={styles.labelButton}>Sort Descending Amount</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.groupButton}>
        <TouchableOpacity
          style={styles.buttonSortByCreateAt}
          onPress={() => handelSortByCreateAt("CREATED_DATE")}
        >
          <Text style={styles.labelButton}>Filter CreateAt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonSortByCreateAt}
          onPress={handelSortByCreateAt}
        >
          <Text style={styles.labelButton}>Filter Invoice date</Text>
        </TouchableOpacity>
      </View>
      <CustomInput
        ref={refInput}
        multiple
        placeholder={"Search With Description"}
        style={styles.inputContainer}
        customInputContainerStyle={styles.questionInput}
        {...searchInput}
        onChangeText={handleSearch}
      />
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        keyExtractor={(item, index) => `ListInvoices${item?.invoiceId}`}
        data={!!searchInput?.value ? dataSearch : dataListInvoices}
        renderItem={renderItem}
        onEndReachedThreshold={0.4}
        onEndReached={() => handelLoadMore()}
        ListEmptyComponent={renderEmptyComponent}
        removeClippedSubviews={false}
        windowSize={50}
        refreshControl={
          <RefreshControl
            removeClippedSubviews={true}
            tintColor={CUSTOM_COLOR.Gray33}
            title={"Pull to refresh"}
            refreshing={false}
            onRefresh={getListDataInvoices}
          />
        }
      />
    </SafeAreaView>
  );
};

export default ListInvoices;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CUSTOM_COLOR.White,
  },
  headerContainer: {
    marginHorizontal: SIZE.Size16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: FONT_SIZE.Size36,
    lineHeight: LINE_HEIGHT.Size36,
    fontFamily: FONT_FAMILY.Medium,
    color: CUSTOM_COLOR.Green06,
  },
  questionContainer: {
    margin: SIZE.Size16,
  },
  screenName: {
    fontSize: FONT_SIZE.Size36,
    lineHeight: LINE_HEIGHT.Size36,
    fontFamily: FONT_FAMILY.Medium,
    color: CUSTOM_COLOR.Green06,
    marginHorizontal: SIZE.Size16,
  },
  containerEmptyComponent: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  inputContainer: {},
  questionInput: {
    height: 30,
  },
  buttonSort: {
    backgroundColor: CUSTOM_COLOR.Yellow07,
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
    height: 30,
    borderRadius: 30,
  },
  buttonSortByCreateAt: {
    marginTop: 15,
    backgroundColor: CUSTOM_COLOR.Blue01,
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
    height: 30,
    borderRadius: 30,
  },
  contentContainerStyle: {
    paddingBottom: 90,
  },
  labelButton: {
    fontSize: 12,
  },
  groupButton: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
