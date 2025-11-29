/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/?redirect=portal#installation/NoNgNARATAdCMEYKQBwGYAMB2EWAsAnFmiAKwGkJ4YoFQIo4loIsJRY7IQCmAdsgxhgCMEKGiJAXUg9yAY3QoIUoA===
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { CKEditor, useCKEditorCloud } from "@ckeditor/ckeditor5-react";
import translations from "ckeditor5/translations/ko.js";
import "./TextEditor.css";
import { ClassicEditor, EventInfo } from "ckeditor5";

const LICENSE_KEY = import.meta.env.VITE_CKEDITOR_LICENSE_KEY;

interface CardTextEditorProps {
  setContent?: (content: string) => void;
  initialContent?: string; // 초기 내용을 위한 prop 추가
  disabled?: boolean; // 에디터 비활성화 여부
}

const CardTextEditor = (props: CardTextEditorProps) => {
  const { setContent, initialContent = "", disabled } = props;

  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const cloud = useCKEditorCloud({ version: "45.2.0" });

  // 에디터 내용 변경
  const handleContentChange = useCallback(
    (_event: EventInfo, editor: ClassicEditor) => {
      if (setContent) {
        setContent(editor.getData());
      }
    },
    [setContent]
  );

  // 에디터 초기화 시 호출되는 이벤트 핸들러
  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  // 에디터 초기화 시 호출되는 이벤트 핸들러
  const { ClassicEditor, editorConfig } = useMemo(() => {
    if (cloud.status !== "success" || !isLayoutReady) {
      return {};
    }

    const {
      ClassicEditor,
      Alignment,
      AutoLink,
      Autosave,
      Bold,
      Essentials,
      FontColor,
      Link,
      List,
      ListProperties,
      Paragraph,
      TodoList,
    } = cloud.CKEditor;

    return {
      ClassicEditor,
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
  }, [cloud, isLayoutReady]);

  return (
    <div
      className="main-container"
      css={{
        "& .ck-content h1, & .ck-content h2, & .ck-content h3, & .ck-content h4, & .ck-content h5, & .ck-content h6, & .ck-content p":
          {
            margin: "0",
          },
      }}
    >
      <div
        className="editor-container editor-container_classic-editor"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor">
          <div ref={editorRef}>
            {ClassicEditor && editorConfig && (
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={initialContent} // 초기 내용 설정
                onChange={handleContentChange}
                disabled={disabled}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardTextEditor;
