import {readFileSync, writeFileSync} from 'fs';
import _ from 'lodash';
import {sep} from 'path';

import {AppConfig, ProjectConfig} from '@models/appconfig';

import {updateProjectConfig} from '@redux/reducers/appConfig';
import {AppDispatch} from '@redux/store';

export interface SerializableObject {
  [name: string]: any;
}

export const CONFIG_PATH = (projectRootPath?: string | null) =>
  projectRootPath ? `${projectRootPath}${sep}.monokle` : '';

export const writeProjectConfigFile = (state: AppConfig | SerializableObject, projectConfig: ProjectConfig | null) => {
  const absolutePath = CONFIG_PATH(state.selectedProjectRootFolder);

  delete projectConfig?.settings?.loadLastProjectOnStartup;
  delete projectConfig?.kubeConfig?.isPathValid;
  delete projectConfig?.kubeConfig?.contexts;
  if (projectConfig && !_.isEmpty(projectConfig)) {
    try {
      const savedConfig: ProjectConfig = JSON.parse(readFileSync(absolutePath, 'utf8'));
      if (!_.isEqual(savedConfig, projectConfig)) {
        writeFileSync(absolutePath, JSON.stringify(projectConfig, null, 4), 'utf-8');
      }
    } catch (error: any) {
      writeFileSync(absolutePath, JSON.stringify(projectConfig, null, 4), 'utf-8');
    }
  } else {
    writeFileSync(absolutePath, ``, 'utf-8');
  }
};

export const populateProjectConfig = (state: AppConfig | SerializableObject) => {
  const applicationConfig: ProjectConfig = {
    scanExcludes: state.scanExcludes,
    fileIncludes: state.fileIncludes,
    folderReadsMaxDepth: state.folderReadsMaxDepth,
  };
  applicationConfig.settings = {
    helmPreviewMode: state.settings.helmPreviewMode,
    kustomizeCommand: state.settings.kustomizeCommand,
    hideExcludedFilesInFileExplorer: state.settings.hideExcludedFilesInFileExplorer,
    isClusterSelectorVisible: state.settings.isClusterSelectorVisible,
    loadLastProjectOnStartup: state.settings.loadLastProjectOnStartup,
    enableHelmWithKustomize: state.settings.enableHelmWithKustomize,
  };
  applicationConfig.kubeConfig = {
    path: state.kubeConfig.path,
    isPathValid: state.kubeConfig.isPathValid,
    contexts: state.kubeConfig.contexts,
  };
  return applicationConfig;
};

export const readProjectConfig = (projectRootPath?: string | null): ProjectConfig | null => {
  if (!projectRootPath) {
    return null;
  }

  try {
    const {settings, kubeConfig, scanExcludes, fileIncludes, folderReadsMaxDepth}: ProjectConfig = JSON.parse(
      readFileSync(CONFIG_PATH(projectRootPath), 'utf8')
    );
    const projectConfig: ProjectConfig = {};
    projectConfig.settings = settings
      ? {
          helmPreviewMode: settings.helmPreviewMode,
          kustomizeCommand: settings.kustomizeCommand,
          hideExcludedFilesInFileExplorer: settings.hideExcludedFilesInFileExplorer,
          isClusterSelectorVisible: settings.isClusterSelectorVisible,
        }
      : undefined;
    projectConfig.kubeConfig = kubeConfig
      ? {
          path: kubeConfig.path,
          currentContext: kubeConfig.currentContext,
          isPathValid: kubeConfig.isPathValid,
        }
      : undefined;

    projectConfig.scanExcludes = scanExcludes;
    projectConfig.fileIncludes = fileIncludes;
    projectConfig.folderReadsMaxDepth = folderReadsMaxDepth;

    return projectConfig;
  } catch (error) {
    return null;
  }
};

export const updateProjectSettings = (dispatch: AppDispatch, projectRootPath?: string | null) => {
  const projectConfig: ProjectConfig | null = readProjectConfig(projectRootPath);
  if (projectConfig) {
    dispatch(updateProjectConfig(projectConfig));
    return;
  }
  dispatch(updateProjectConfig(null));
};

export const mergeConfigs = (baseConfig: ProjectConfig, config?: ProjectConfig | null): ProjectConfig => {
  if (!(baseConfig && baseConfig.settings && baseConfig.kubeConfig)) {
    throw Error('Base config must be set');
  }

  if (!config) {
    return baseConfig;
  }

  const serializedBaseConfig: SerializableObject = serializeObject(baseConfig);
  const serializedConfig: SerializableObject = serializeObject(baseConfig);

  Object.keys(serializedBaseConfig).forEach((key: string) => {
    if (!_.isUndefined(serializedConfig[key])) {
      serializedBaseConfig[key] = serializedConfig[key];
    }
  });

  return deserializeObject(baseConfig);
};

export const serializeObject = (objectToSerialize?: SerializableObject | null, prefix?: string): SerializableObject => {
  let serialized: any = {};

  if (!objectToSerialize) {
    return serialized;
  }
  Object.keys(objectToSerialize).forEach(key => {
    if (_.isObject(objectToSerialize[key]) && !_.isArray(objectToSerialize[key])) {
      const result: any = serializeObject(objectToSerialize[key], key);
      serialized = {
        ...serialized,
        ...result,
      };
    } else {
      const objectKey = prefix ? `${prefix}.${key}` : key;
      serialized[objectKey] = objectToSerialize[key];
    }
  });
  return serialized;
};

export const deserializeObject = (objectToDeserialize?: SerializableObject | null): SerializableObject => {
  const deserialized = {};

  if (!objectToDeserialize) {
    return deserialized;
  }

  Object.keys(objectToDeserialize).forEach(key => {
    _.set(deserialized, key, objectToDeserialize[key]);
  });
  return deserialized;
};
