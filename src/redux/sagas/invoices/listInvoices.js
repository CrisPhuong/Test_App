import {
  createInvoicesFailure,
  createInvoicesSuccess,
  getListInvoicesFailure,
  getListInvoicesSuccess,
} from "actions/listInvoices";
import { API_URL } from "constants/apiUrl";
import { call, put } from "redux-saga/effects";
import APIUtils from "utils/apiUtils";

export const apiLogin = (params) => {
  return APIUtils.postFirebase(`${API_URL.GET_TOKEN}`, params);
};

export const apiGetListInvoices = (params) => {
  const { org_token } = params;
  return APIUtils.get(`${API_URL.GET_LIST_INVOICE}`, params, {
    "org-token": org_token,
  });
};

export const apiCreateInvoices = (params) => {
  const { org_token } = params;
  return APIUtils.post(`${API_URL.CREATE_INVOICE}`, JSON.stringify(params), {
    "org-token": org_token,
    "Operation-Mode": "SYNC",
  });
};

export function* getListInvoices({ payload, success, failure }) {
  try {
    const data = yield call(apiGetListInvoices, payload);
    if (data?.status === 200) {
      yield put(getListInvoicesSuccess(data.data));
      success && success(data.data);
    } else {
      yield put(getListInvoicesFailure(data.response));
      failure && failure(data.response);
    }
  } catch (error) {
    yield put(getListInvoicesFailure(error));
    failure && failure(error);
  }
}

export function* createInvoices({ payload, success, failure }) {
  try {
    const data = yield call(apiCreateInvoices, payload);
    if (data?.status === 201) {
      yield put(createInvoicesSuccess(data.data));
      success && success(data.data);
    } else {
      yield put(createInvoicesFailure(data));
      failure && failure(data);
    }
  } catch (error) {
    yield put(createInvoicesFailure(error));
    failure && failure(error);
  }
}
