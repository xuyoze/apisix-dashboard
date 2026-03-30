/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { createFileRoute } from '@tanstack/react-router';
import { Tag } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getRouteListQueryOptions, useRouteList } from '@/apis/hooks';
import type { WithServiceIdFilter } from '@/apis/routes';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { ToAddPageBtn, ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_ROUTES } from '@/config/constant';
import { queryClient } from '@/config/global';
import type { APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import type { ListPageKeys } from '@/utils/useTablePagination';

export type RouteListProps = {
  routeKey: Extract<ListPageKeys, '/routes/' | '/services/detail/$id/routes/'>;
  defaultParams?: Partial<WithServiceIdFilter>;
  ToDetailBtn: (props: {
    record: APISIXType['RespRouteItem'];
  }) => React.ReactNode;
};

export const RouteList = (props: RouteListProps) => {
  const { routeKey, ToDetailBtn, defaultParams } = props;
  const { data, isLoading, refetch, pagination } = useRouteList(
    routeKey,
    defaultParams
  );
  const { t } = useTranslation();

  const columns = useMemo<ProColumns<APISIXType['RespRouteItem']>[]>(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
        hideInTable: true,
      },
      {
        dataIndex: ['value', 'name'],
        title: t('form.basic.name'),
        key: 'name',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'desc'],
        title: t('form.basic.desc'),
        key: 'desc',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'hosts'],
        title: t('form.basic.hosts'),
        key: 'hosts',
        valueType: 'text',
        render: (_, record) => {
          // 获取 hosts 和 host 值
          const hostsValue = record?.value?.hosts || [];
          const hostValue = record?.value?.host || '';

          // 如果 hosts 是数组且有值，将每个值用 Tag 包裹
          let hostsElement = null;
          if (Array.isArray(hostsValue) && hostsValue.length > 0) {
            hostsElement = (
              <span>
                {hostsValue.map((item, index) => (
                  <Tag key={`hosts-${index}`} style={{ margin: '2px' }}>
                    {item}
                  </Tag>
                ))}
              </span>
            );
          } else if (hostsValue && !Array.isArray(hostsValue)) {
            // 如果 hosts 不是数组而是单个值
            hostsElement = <Tag style={{ margin: '2px' }}>{hostsValue}</Tag>;
          }

          // 如果两个值都存在，则用视觉分割线连接
          if (hostsElement && hostValue) {
            return (
              <span>
                {hostsElement} <span style={{ margin: '0 4px' }}>—</span> <Tag style={{ margin: '2px' }}>{hostValue}</Tag>
              </span>
            );
          }
          // 如果只有 hosts 存在
          else if (hostsElement) {
            return hostsElement;
          }
          // 如果只有 host 存在
          else if (hostValue) {
            return <Tag style={{ margin: '2px' }}>{hostValue}</Tag>;
          }
          // 如果都没有，则返回空字符串
          else {
            return '';
          }
        }
      },
      {
        dataIndex: ['value', 'uris'],
        title: 'URIS',
        key: 'uris',
        valueType: 'text',
        render: (_, record) => {
          // 从记录中获取 uris 和 uri
          const uris = record?.value?.uris || [];
          const uri = record?.value?.uri || '';
          
          // 如果 uris 是数组且有值，将每个值用 Tag 包裹
          let urisElement = null;
          if (Array.isArray(uris) && uris.length > 0) {
            urisElement = (
              <span>
                {uris.map((item, index) => (
                  <Tag key={index} style={{ margin: '2px' }}>
                    {item}
                  </Tag>
                ))}
              </span>
            );
          } else if (uris && !Array.isArray(uris)) {
            // 如果 uris 不是数组而是单个值
            urisElement = <Tag style={{ margin: '2px' }}>{uris}</Tag>;
          }
          
          // 如果两个值都存在，则用视觉分割线连接
          if (urisElement && uri) {
            return (
              <span>
                {urisElement} <span style={{ margin: '0 4px' }}>—</span> <Tag style={{ margin: '2px' }}>{uri}</Tag>
              </span>
            );
          } 
          // 如果只有 uris 存在
          else if (urisElement) {
            return urisElement;
          } 
          // 如果只有 uri 存在
          else if (uri) {
            return <Tag style={{ margin: '2px' }}>{uri}</Tag>;
          }
          // 如果都没有，则返回空字符串
          else {
            return '';
          }
        }
      },
      {
        dataIndex: ['value', 'methods'],
        title: 'Methods',
        key: 'methods',
        valueType: 'text',
        render: (_, record) => {
          // 从记录中获取 methods
          const methods = record?.value?.methods || [];
          
          if (!Array.isArray(methods) || methods.length === 0) {
            return '';
          }
          
          // 定义不同HTTP方法对应的颜色
          const getMethodColor = (method: string) => {
            const methodUpper = method.toUpperCase();
            switch (methodUpper) {
              case 'GET':
                return 'blue';
              case 'POST':
                return 'green';
              case 'PUT':
                return 'orange';
              case 'DELETE':
                return 'red';
              case 'PATCH':
                return 'volcano';
              case 'HEAD':
                return 'geekblue';
              case 'OPTIONS':
                return 'purple';
              default:
                return 'default';
            }
          };
          
          return (
            <span>
              {methods.map((method, index) => (
                <Tag 
                  key={index} 
                  color={getMethodColor(method)} 
                  style={{ margin: '2px' }}
                >
                  {method.toUpperCase()}
                </Tag>
              ))}
            </span>
          );
        }
      },
      {
        dataIndex: ['value', 'status'],
        title: t('form.basic.status'),
        key: 'status',
        valueType: 'select',
        valueEnum: {
          1: {
            text: t('form.basic.statusOption.1'),
            status: 'Success',
          },
          0: {
            text: t('form.basic.statusOption.0'),
            status: 'Default',
          },
        },
        render: (_, record) => {
          const status = record?.value?.status;
          // 当 status 为 null 或 undefined 时，默认显示为 'Enabled'
          const statusText = status === 0 ? t('form.basic.statusOption.0') : t('form.basic.statusOption.1');
          const statusColor = status === 0 ? 'red' : 'green';

          return (
            <span style={{ color: statusColor }}>
              {statusText}
            </span>
          );
        }
      },

      {
        title: t('table.actions'),
        valueType: 'option',
        key: 'option',
        width: 120,
        render: (_, record) => [
          <ToDetailBtn key="detail" record={record} />,
          <DeleteResourceBtn
            key="delete"
            name={t('routes.singular')}
            target={record.value.id}
            api={`${API_ROUTES}/${record.value.id}`}
            onSuccess={refetch}
          />,
        ],
      },
    ];
  }, [t, ToDetailBtn, refetch]);

  return (
    <AntdConfigProvider>
      <ProTable
        columns={columns}
        dataSource={data.list}
        rowKey="id"
        loading={isLoading}
        search={false}
        options={false}
        pagination={pagination}
        cardProps={{ bodyStyle: { padding: 0 } }}
        toolbar={{
          menu: {
            type: 'inline',
            items: [
              {
                key: 'add',
                label: (
                  <ToAddPageBtn
                    key="add"
                    label={t('info.add.title', {
                      name: t('routes.singular'),
                    })}
                    to={`${routeKey}add`}
                  />
                ),
              },
            ],
          },
        }}
      />
    </AntdConfigProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('sources.routes')} />
      <RouteList
        routeKey="/routes/"
        ToDetailBtn={({ record }) => (
          <ToDetailPageBtn
            key="detail"
            to="/routes/detail/$id"
            params={{ id: record.value.id }}
          />
        )}
      />
    </>
  );
}

export const Route = createFileRoute('/routes/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getRouteListQueryOptions(deps)),
});
