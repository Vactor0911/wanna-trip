/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/?redirect=portal#installation/NoNgNARATAdCMAYKQOwFYoEYCcbsu0wQSgQBYoQBmMs7ADhHuxBDLQRSioSqmQgBrAPbIEYYJjDip4mQF1UAMyJoUAYwjygA
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Alignment,
  AutoLink,
  Autosave,
  Bold,
  Essentials,
  FontColor,
  ImageEditing,
  ImageUtils,
  Link,
  List,
  ListProperties,
  Paragraph,
  TodoList,
  EventInfo,
} from "ckeditor5";

import translations from "ckeditor5/translations/ko.js";

import "ckeditor5/ckeditor5.css";

import "./TextEditor.css";

const LICENSE_KEY = import.meta.env.VITE_CKEDITOR_LICENSE_KEY;

interface CardTextEditorProps {
  setContent?: (content: string) => void;
  initialContent?: string; // 초기 내용을 위한 prop 추가
  disabled?: boolean; // 에디터 비활성화 여부
}

export default function CardTextEditor(props: CardTextEditorProps) {
  const { setContent, initialContent = "", disabled } = props;

  const editorContainerRef = useRef(null);
  const editorRef = useRef<ClassicEditor | null>(null); // 에디터 인스턴스를 저장하는 ref
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // 에디터 초기화 시 호출되는 이벤트 핸들러
  const handleEditorReady = useCallback(
    (editor: ClassicEditor) => {
      editorRef.current = editor;

      // 초기 내용이 있으면 설정
      if (initialContent) {
        editor.setData(initialContent);
      }

      // 내용 변경 이벤트 리스너 추가
      editor.model.document.on("change:data", () => {
        if (setContent) {
          setContent(editor.getData());
        }
      });
    },
    [initialContent, setContent]
  );

  // 내용 변경 시 호출되는 이벤트 핸들러 (blur 이벤트)
  const handleContentChange = useCallback(
    (_: EventInfo, editor: ClassicEditor) => {
      if (setContent) {
        const newContent = editor.getData();
        setContent(newContent);
      }
    },
    [setContent]
  );

  // initialContent가 변경될 때마다 에디터 내용 업데이트
  useEffect(() => {
    if (editorRef.current && initialContent !== undefined) {
      // 현재 에디터 내용과 initialContent가 다를 때만 업데이트
      const currentContent = editorRef.current.getData();
      if (currentContent !== initialContent) {
        editorRef.current.setData(initialContent);
      }
    }
  }, [initialContent]);

  // 기본 레이아웃 설정
  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  // 에디터 설정
  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {};
    }

    return {
      editorConfig: {
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "bold",
            "fontColor",
            "|",
            "alignment",
            "bulletedList",
            "numberedList",
            "todoList",
            "|",
            "link",
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          Alignment,
          AutoLink,
          Autosave,
          Bold,
          Essentials,
          FontColor,
          ImageEditing,
          ImageUtils,
          Link,
          List,
          ListProperties,
          Paragraph,
          TodoList,
        ],
        blockToolbar: [
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "bold",
          "italic",
          "|",
          "link",
          "insertImage",
          "insertTable",
          "|",
          "bulletedList",
          "numberedList",
          "outdent",
          "indent",
        ],
        language: "ko",
        licenseKey: LICENSE_KEY,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
          decorators: {
            toggleDownloadable: {
              mode: "manual" as const,
              label: "Downloadable",
              attributes: {
                download: "file",
              },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        placeholder: "내용을 입력해주세요.",
        translations: [translations],
      },
    };
  }, [isLayoutReady]);

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_classic-editor editor-container_include-block-toolbar"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor">
          {editorConfig && (
            <CKEditor
              editor={ClassicEditor}
              config={editorConfig}
              data={initialContent}
              onReady={handleEditorReady}
              onBlur={handleContentChange}
              onChange={(_, editor) => {
                if (setContent) {
                  setContent(editor.getData());
                }
              }}
              disabled={disabled}
            />
          )}
        </div>
      </div>
    </div>
  );
}
