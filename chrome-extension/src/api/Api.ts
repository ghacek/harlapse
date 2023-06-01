/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  CreateNewSnapshotData,
  CreateNewSnapshotPayload,
  FinalizeSnapshotCaptureData,
  FinalizeSnapshotCapturePayload,
  GetShanpshotInfoData,
  GetSnapshotAnnotationsConfigData,
  GetSnapshotAnnotationsSvgData,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Api<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Snapshot Controller
   * @name CreateNewSnapshot
   * @request POST:/api/snapshot
   */
  createNewSnapshot = (data: CreateNewSnapshotPayload, params: RequestParams = {}) =>
    this.request<CreateNewSnapshotData, any>({
      path: `/api/snapshot`,
      method: 'POST',
      body: data,
      type: ContentType.FormData,
      ...params,
    });
  /**
   * No description
   *
   * @tags Snapshot Controller
   * @name GetShanpshotInfo
   * @request GET:/api/snapshot/{ref}
   */
  getShanpshotInfo = (ref: string, params: RequestParams = {}) =>
    this.request<GetShanpshotInfoData, any>({
      path: `/api/snapshot/${ref}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Snapshot Controller
   * @name GetSnapshotAnnotationsConfig
   * @request GET:/api/snapshot/{ref}/annotations-config
   */
  getSnapshotAnnotationsConfig = (ref: string, params: RequestParams = {}) =>
    this.request<GetSnapshotAnnotationsConfigData, any>({
      path: `/api/snapshot/${ref}/annotations-config`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Snapshot Controller
   * @name GetSnapshotAnnotationsSvg
   * @request GET:/api/snapshot/{ref}/annotations-svg
   */
  getSnapshotAnnotationsSvg = (ref: string, params: RequestParams = {}) =>
    this.request<GetSnapshotAnnotationsSvgData, any>({
      path: `/api/snapshot/${ref}/annotations-svg`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Snapshot Controller
   * @name FinalizeSnapshotCapture
   * @request POST:/api/snapshot/{ref}/finalize-capture
   */
  finalizeSnapshotCapture = (ref: string, data: FinalizeSnapshotCapturePayload, params: RequestParams = {}) =>
    this.request<FinalizeSnapshotCaptureData, any>({
      path: `/api/snapshot/${ref}/finalize-capture`,
      method: 'POST',
      body: data,
      type: ContentType.FormData,
      ...params,
    });
}
