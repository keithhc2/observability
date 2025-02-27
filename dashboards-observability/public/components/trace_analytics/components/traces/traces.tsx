/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable react-hooks/exhaustive-deps */

import { EuiSpacer, EuiTitle, PropertySort } from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { TraceAnalyticsComponentDeps } from '../../home';
import { handleTracesRequest } from '../../requests/traces_request_handler';
import { getValidFilterFields } from '../common/filters/filter_helpers';
import { filtersToDsl } from '../common/helper_functions';
import { SearchBar } from '../common/search_bar';
import { TracesTable } from './traces_table';

interface TracesProps extends TraceAnalyticsComponentDeps {
  appId?: string;
  appName?: string;
  page: 'traces' | 'app';
  openTraceFlyout?: (traceId: string) => void;
  switchToEditViz?: any;
}

export function Traces(props: TracesProps) {
  const { appId, appName, parentBreadcrumb, page, openTraceFlyout, switchToEditViz } = props;
  const [tableItems, setTableItems] = useState([]);
  const [redirect, setRedirect] = useState(true);
  const [loading, setLoading] = useState(false);
  const appTraces = page === 'app';

  const breadCrumbs = appTraces
    ? [
        {
          text: 'Application analytics',
          href: '#/application_analytics',
        },
        {
          text: `${appName}`,
          href: `#/application_analytics/${appId}`,
        },
      ]
    : [
        {
          text: 'Trace analytics',
          href: '#/trace_analytics/home',
        },
        {
          text: 'Traces',
          href: '#/trace_analytics/traces',
        },
      ];

  useEffect(() => {
    props.chrome.setBreadcrumbs([parentBreadcrumb, ...breadCrumbs]);
    const validFilters = getValidFilterFields('traces');
    props.setFilters([
      ...props.filters.map((filter) => ({
        ...filter,
        locked: validFilters.indexOf(filter.field) === -1,
      })),
    ]);
    setRedirect(false);
    if (appTraces) {
      switchToEditViz('');
    }
  }, []);

  useEffect(() => {
    if (!redirect && props.indicesExist) refresh();
  }, [props.filters, props.appConfigs]);

  const refresh = async (sort?: PropertySort) => {
    setLoading(true);
    const DSL = filtersToDsl(
      props.filters,
      props.query,
      props.startTime,
      props.endTime,
      props.page,
      appTraces ? props.appConfigs : []
    );
    const timeFilterDSL = filtersToDsl([], '', props.startTime, props.endTime, props.page);
    await handleTracesRequest(props.http, DSL, timeFilterDSL, tableItems, setTableItems, sort);
    setLoading(false);
  };

  return (
    <>
      {appTraces ? (
        <EuiSpacer size="m" />
      ) : (
        <EuiTitle size="l">
          <h2 style={{ fontWeight: 430 }}>Traces</h2>
        </EuiTitle>
      )}
      <SearchBar
        query={appTraces ? '' : props.query}
        filters={props.filters}
        appConfigs={props.appConfigs}
        setFilters={props.setFilters}
        setQuery={props.setQuery}
        startTime={props.startTime}
        setStartTime={props.setStartTime}
        endTime={props.endTime}
        setEndTime={props.setEndTime}
        refresh={refresh}
        page={page}
      />
      <EuiSpacer size="m" />
      <TracesTable
        items={tableItems}
        refresh={refresh}
        indicesExist={props.indicesExist}
        loading={loading}
        page={page}
        openTraceFlyout={openTraceFlyout}
      />
    </>
  );
}
