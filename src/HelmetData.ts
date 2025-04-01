import type HelmetDispatcher from './Dispatcher';
import mapStateOnServer from './server';
import type { HelmetServerState, MappedServerState } from './types';

const instances: HelmetDispatcher[] = [];

export function clearInstances() {
  instances.length = 0;
}

export interface HelmetDataType {
  instances: HelmetDispatcher[];
  context: HelmetDataContext;
}

interface HelmetDataContext {
  helmet: HelmetServerState;
}

export const isDocument = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

export default class HelmetData implements HelmetDataType {
  instances: HelmetDispatcher[];
  canUseDOM: boolean;
  context: HelmetDataContext;
  value: {
    setHelmet: (serverState: HelmetServerState) => void;
    helmetInstances: {
      get: () => HelmetDispatcher[];
      add: (instance: HelmetDispatcher) => void;
      remove: (instance: HelmetDispatcher) => void;
    };
  };

  constructor(context: any, canUseDOM: boolean = false) {
    // Initialize class properties in constructor
    this.instances = [];
    this.canUseDOM = canUseDOM || isDocument;
    this.context = context;

    this.value = {
      setHelmet: (serverState: HelmetServerState) => {
        this.context.helmet = serverState;
      },
      helmetInstances: {
        get: () => (this.canUseDOM ? instances : this.instances),
        add: (instance: HelmetDispatcher) => {
          (this.canUseDOM ? instances : this.instances).push(instance);
        },
        remove: (instance: HelmetDispatcher) => {
          const index = (this.canUseDOM ? instances : this.instances).indexOf(instance);
          if (index > -1) {
            (this.canUseDOM ? instances : this.instances).splice(index, 1);
          }
        },
      },
    };

    if (!this.canUseDOM) {
      context.helmet = mapStateOnServer({
        baseTag: [],
        bodyAttributes: {},
        encodeSpecialCharacters: true,
        htmlAttributes: {},
        linkTags: [],
        metaTags: [],
        noscriptTags: [],
        scriptTags: [],
        styleTags: [],
        title: '',
        titleAttributes: {},
      } as MappedServerState);
    }
  }
}
