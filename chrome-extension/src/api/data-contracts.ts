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

export interface CreateSnapshotResult {
  ref?: string;
  uploadBasicInfoLink?: string;
  uploadScreenshotLink?: string;
  uploadHarLink?: string;
  uploadConsoleLink?: string;
  uploadHtmlLink?: string;
}

/**
 * @format date
 * @example "2022-03-10T00:00:00.000Z"
 */
export type Date = string;

export interface Snapshot {
  /** @format int64 */
  id?: number;
  ref?: string;
  pageTitle?: string;
  pageUrl?: string;
  title?: string;
  description?: string;
  hasAnnotations?: boolean;
  created?: Date;
}

export interface CreateNewSnapshotPayload {
  title?: string;
  url?: string;
}

export type CreateNewSnapshotData = CreateSnapshotResult;

export type GetShanpshotInfoData = Snapshot;

/** @format binary */
export type GetSnapshotAnnotationsConfigData = File;

/** @format binary */
export type GetSnapshotAnnotationsSvgData = File;

export interface FinalizeSnapshotCapturePayload {
  title?: string;
  description?: string;
  /** @format binary */
  'annotations-config'?: File;
  /** @format binary */
  'annotations-svg'?: File;
}

export type FinalizeSnapshotCaptureData = any;
