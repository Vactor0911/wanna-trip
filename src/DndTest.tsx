import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// 초기 리스트 데이터
const initialLists = [
  {
    id: "list1",
    title: "List 1",
    items: [
      { id: "item-1", content: "Item 1" },
      { id: "item-2", content: "Item 2" },
      { id: "item-3", content: "Item 3" },
      { id: "item-4", content: "Item 4" },
    ],
  },
  {
    id: "list2",
    title: "List 2",
    items: [
      { id: "item-5", content: "Item 5" },
      { id: "item-6", content: "Item 6" },
      { id: "item-7", content: "Item 7" },
      { id: "item-8", content: "Item 8" },
    ],
  },
  {
    id: "list3",
    title: "List 3",
    items: [
      { id: "item-9", content: "Item 9" },
      { id: "item-10", content: "Item 10" },
      { id: "item-11", content: "Item 11" },
      { id: "item-12", content: "Item 12" },
    ],
  },
];

const MultipleVerticalLists = () => {
  const [lists, setLists] = useState(initialLists); // 리스트 데이터 상태

  // 드래그 종료 핸들러
  const onDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;

    // 리스트 정렬
    if (type === "list") {
      const reordered = Array.from(lists);
      const [movedList] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, movedList);
      setLists(reordered);

      console.log("리스트가 정렬되었습니다.", source, destination);
      return;
    }

    // 아이템 정렬
    const sourceListIndex = lists.findIndex(
      (list) => list.id === source.droppableId
    ); // 소스 리스트 인덱스
    const destListIndex = lists.findIndex(
      (list) => list.id === destination.droppableId
    ); // 대상 리스트 인덱스

    const sourceList = lists[sourceListIndex]; // 소스 리스트
    const destList = lists[destListIndex]; // 대상 리스트

    const sourceItems = Array.from(sourceList.items); // 소스 리스트 아이템들
    const destItems = Array.from(destList.items); // 대상 리스트 아이템들

    const [movedItem] = sourceItems.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // 같은 리스트 내에서 이동
      sourceItems.splice(destination.index, 0, movedItem);

      const updatedLists = Array.from(lists);
      updatedLists[sourceListIndex] = {
        ...sourceList,
        items: sourceItems,
      };
      setLists(updatedLists);

      console.log(
        "아이템이 같은 리스트 내에서 이동되었습니다.",
        source,
        destination
      );
    } else {
      // 다른 리스트로 이동
      destItems.splice(destination.index, 0, movedItem);

      const updatedLists = Array.from(lists);
      updatedLists[sourceListIndex] = {
        ...sourceList,
        items: sourceItems,
      };
      updatedLists[destListIndex] = {
        ...destList,
        items: destItems,
      };
      setLists(updatedLists);

      console.log(
        "아이템이 다른 리스트로 이동되었습니다.",
        source,
        destination
      );
    }
  };

  return (
    <div style={{ display: "flex", padding: "16px" }}>
      {/* 드래그 & 드롭 래퍼 */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* 리스트를 놓을 요소 */}
        <Droppable droppableId="lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: "flex", gap: "16px" }}
            >
              {lists.map((list, listIndex) => (
                // 리스트
                <Draggable
                  key={list.id}
                  draggableId={list.id}
                  index={listIndex}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        border: "2px solid #ccc",
                        borderRadius: 4,
                        background: snapshot.isDragging ? "#ffe4b2" : "#f0f0f0",
                      }}
                    >
                      <div
                        {...provided.dragHandleProps}
                        style={{
                          background: "#ddd",
                          padding: "4px",
                          textAlign: "center",
                          cursor: "grab",
                        }}
                      >
                        <strong>{list.title}</strong>
                      </div>

                      {/* 리스트 내부 아이템을 놓을 요소 */}
                      <Droppable droppableId={list.id} type="item">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              minHeight: 300,
                              padding: 8,
                              background: snapshot.isDraggingOver
                                ? "#d0f0fd"
                                : "#ffffff",
                            }}
                          >
                            {list.items.map((item, index) => (
                              // 아이템
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      userSelect: "none",
                                      margin: "0 0 8px 0",
                                      padding: 8,
                                      background: snapshot.isDragging
                                        ? "#a0e0ff"
                                        : "#ffffff",
                                      border: "1px solid #ccc",
                                      borderRadius: 4,
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    {item.content}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default MultipleVerticalLists;
