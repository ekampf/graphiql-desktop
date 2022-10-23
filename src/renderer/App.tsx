// import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { GraphiQL, GraphiQLInterface } from 'graphiql';
import type { DocumentNode } from 'graphql';
import {
  useTheme,
  ImplementsIcon,
  GraphiQLPlugin,
  GraphiQLProvider,
  usePluginContext,
  useExecutionContext,
  useEditorContext,
  useQueryEditor,
  useSchemaContext,
  useStorageContext,
} from '@graphiql/react';
import { useExplorerPlugin } from '@graphiql/plugin-explorer';
import { createGraphiQLFetcher } from '@graphiql/toolkit';

import './App.css';
import 'graphiql/graphiql.min.css';
import '@graphiql/plugin-explorer/dist/style.css';

const useLocalStorage = (
  key: string,
  fallback?: string
): [string | null, Dispatch<SetStateAction<string | null>>] => {
  const [value, setValue] = useState(
    localStorage.getItem(key) ?? fallback ?? null
  );

  useEffect(() => {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }, [key, value]);

  return [value, setValue];
};

const GraphiQLInterfaceWrapper = ({
  onEditQuery,
  setVisiblePlugin,
}: {
  onEditQuery(value: string, documentAST?: DocumentNode): void;
  setVisiblePlugin(value: SetStateAction<string | null>): void;
  // setTheme(value: SetStateAction<string | null>): void;
}) => {
  const editorContext = useEditorContext({ nonNull: true });
  // const executionContext = useExecutionContext({ nonNull: true });
  const pluginContext = usePluginContext();
  // const queryEditorContext = useQueryEditor({ onEdit: onEditQuery });
  const schemaContext = useSchemaContext({ nonNull: true });
  // const storageContext = useStorageContext();

  // console.dir({
  //   editorContext,
  //   executionContext,
  //   schemaContext,
  //   pluginContext,
  //   queryEditorContext,
  //   storageContext,
  // });

  useEffect(() => {
    const callback = (event: KeyboardEvent) => {
      const isCommand = event.metaKey || event.ctrlKey;
      if (isCommand && event.code.startsWith('Digit')) {
        event.preventDefault();
        const index = Number(event.key) - 1;
        if (index >= 0 && index < editorContext.tabs.length) {
          editorContext?.changeTab(index);
        } else {
          editorContext?.changeTab(editorContext.tabs.length - 1);
        }
      }
      if (isCommand && event.code === 'KeyR') {
        event.preventDefault();
        schemaContext.introspect();
      }
      if (isCommand && event.code === 'KeyD') {
        event.preventDefault();
        setVisiblePlugin('Documentation Explorer');
      }
      if (isCommand && event.code === 'KeyK') {
        pluginContext?.setVisiblePlugin('Documentation Explorer');
        setVisiblePlugin('Documentation Explorer');
      }
      if (isCommand && event.code === 'KeyY') {
        event.preventDefault();
        setVisiblePlugin('History');
      }
      if (isCommand && event.code === 'KeyE') {
        event.preventDefault();
        setVisiblePlugin('GraphiQL Explorer');
      }
      if (isCommand && event.code === 'KeyT') {
        event.preventDefault();
        editorContext?.addTab();
      }
      if (isCommand && event.code === 'KeyW') {
        event.preventDefault();
        editorContext?.closeTab(editorContext.activeTabIndex);
      }
    };
    document.addEventListener('keydown', callback);
    return () => {
      document.removeEventListener('keydown', callback);
    };
  }, [pluginContext, editorContext, schemaContext, setVisiblePlugin]);

  return (
    <GraphiQLInterface>
      <GraphiQL.Logo>
        <></>
      </GraphiQL.Logo>
    </GraphiQLInterface>
  );
};

const GraphiQLWrapper = () => {
  const [query, setQuery] = useState('');
  // const [theme, setTheme] = useLocalStorage('graphiql:theme');
  const [url, setURL] = useLocalStorage('graphiql-desktop:url');
  const fetcher = createGraphiQLFetcher({
    url: url ?? 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  });
  const explorerPlugin = useExplorerPlugin({
    query,
    onEdit: setQuery,
  });
  const [visiblePlugin, setVisiblePlugin] = useLocalStorage(
    'graphiql-desktop:lastVisiblePlugin'
  );

  // TODO: base off of theme when useTheme properly notifies of changes
  // const background = theme === 'light' ? '#ffffff' : '#212a3b';

  return (
    // <div className="graphiql-desktop" style={{ background }}>
    <div className="graphiql-desktop">
      <input
        type="text"
        className="graphiql-desktop-url-input"
        value={url ?? undefined}
        placeholder="Endpoint URL"
        onChange={(e) => setURL(e.target.value)}
      />
      <GraphiQLProvider
        fetcher={fetcher}
        query={query}
        plugins={[explorerPlugin]}
        shouldPersistHeaders
        visiblePlugin={visiblePlugin ?? ''}
        onTogglePluginVisibility={(plugin) => {
          setVisiblePlugin(plugin?.title ?? '');
        }}
      >
        <GraphiQLInterfaceWrapper
          onEditQuery={setQuery}
          setVisiblePlugin={setVisiblePlugin}
          // setTheme={setTheme}
        />
      </GraphiQLProvider>
    </div>
  );
};

export default function App() {
  return <GraphiQLWrapper />;
}
