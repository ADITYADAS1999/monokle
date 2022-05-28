import {shell} from 'electron';

import React, {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {Switch, Tooltip} from 'antd';
import {ColumnsType} from 'antd/lib/table';

import {TOOLTIP_DELAY} from '@constants/constants';

import {reprocessAllResources, toggleRule} from '@redux/reducers/main';

import Icon, {IconNames} from '@components/atoms/Icon';

import Colors from '@styles/Colors';

import type {Rule, Severity} from './ValidationOpenPolicyAgentTable';

export function useOpenPolicyAgentTable() {
  const dispatch = useDispatch();

  const handleToggle = useCallback(
    (ruleId: string) => {
      dispatch(toggleRule({ruleId}));
      dispatch(reprocessAllResources());
    },
    [dispatch]
  );

  const columns: ColumnsType<Rule> = useMemo(() => {
    return [
      {
        key: 'description',
        title: 'Description',
        dataIndex: 'name',
        render: (_value, record) => {
          const {description, learnMoreUrl} = record;
          return (
            <Tooltip
              mouseEnterDelay={TOOLTIP_DELAY}
              title={
                <p>
                  {description}{' '}
                  {!learnMoreUrl ? null : <a onClick={() => shell.openExternal(learnMoreUrl)}>Learn more</a>}
                </p>
              }
              placement="bottomLeft"
              overlayStyle={{maxWidth: '500px'}}
            >
              {record.name}
            </Tooltip>
          );
        },
      },
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'id',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => (a.id === b.id ? 0 : a.id > b.id ? 1 : -1),
      },
      {
        key: 'severity',
        title: 'Severity',
        dataIndex: 'severity',
        sorter: (a, b) => SEVERITY_ORDER_MAP[a.severity] - SEVERITY_ORDER_MAP[b.severity],
        render: (_value, record) => <Icon {...SEVERITY_ICON_MAP[record.severity]} />,
      },
      {
        key: 'enabled',
        title: 'Enabled?',
        render: (_value, rule) => {
          return <Switch checked={rule.enabled} onChange={() => handleToggle(rule.id)} />;
        },
        sorter: (a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1),
      },
    ];
  }, [handleToggle]);

  return columns;
}

const SEVERITY_ORDER_MAP: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const SEVERITY_ICON_MAP: Record<Severity, {name: IconNames; color: Colors}> = {
  high: {name: 'severity-high', color: Colors.red7},
  medium: {name: 'severity-medium', color: Colors.red7},
  low: {name: 'severity-low', color: Colors.green7},
};
