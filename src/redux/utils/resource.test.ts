import { getNamespaces } from './resource';
import { ResourceMapType } from '../../models/state';

test('get-namspaces', () => {
  expect(getNamespaces({}).length).toBe(0);

  const resourceMapWithoutNamespaces: ResourceMapType = {};
  resourceMapWithoutNamespaces['1'] = {
    id: '1',
    file: 'filename',
    folder: 'folder',
    name: 'resource name',
    kind: 'ResourceType',
    version: '1.0',
    highlight: false,
    selected: false,
    linePos: 0,
    content: {},
    docIndex: 0,
  };

  expect(getNamespaces(resourceMapWithoutNamespaces).length).toBe(0);

  resourceMapWithoutNamespaces['1'].namespace = 'test';
  expect(getNamespaces(resourceMapWithoutNamespaces).length).toBe(1);

  resourceMapWithoutNamespaces['2'] = { ...resourceMapWithoutNamespaces['1'] };
  expect(getNamespaces(resourceMapWithoutNamespaces).length).toBe(1);

  resourceMapWithoutNamespaces['3'] = { ...resourceMapWithoutNamespaces['1'], namespace: 'test2' };
  expect(getNamespaces(resourceMapWithoutNamespaces).length).toBe(2);
});