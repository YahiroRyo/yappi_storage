import styles from "./index.module.scss";
import { CSSProperties, useEffect, useState } from "react";
import { Text } from "../text";
import { uiConfig } from "../uiConfig";
import { Select } from "../select";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useRouter } from "next/navigation";

type RowData = Record<string, React.ReactNode>;

type Props<T extends RowData> = {
  isFixedHead: boolean;
  headers: Record<Extract<keyof T, string>, string>;
  hiddenHeaders?: Array<Extract<keyof T, string>>;
  data: T[];
  showColumn?: (row: T, key: string) => any;
  rowHeight?: string;
  onSelected?: (datum: T) => void;
  onMultipleSelected?: (data: T[]) => void;
  multipleSelectable?: boolean;
  href?: (datum: T) => string;
  selectedRowBackgroundColor?: string;
  selectedChildren: React.ReactNode;
  onDoubleClick?: (datum: T) => void;
};

export const SelectableTable = <T extends RowData>({
  headers,
  hiddenHeaders,
  data,
  showColumn,
  rowHeight = "48px",
  onSelected,
  onMultipleSelected,
  multipleSelectable = false,
  href,
  selectedRowBackgroundColor,
  selectedChildren,
  onDoubleClick,
}: Props<T>) => {
  const router = useRouter();
  const [rowData, setRowData] = useState<
    {
      isSelected: boolean;
      style: CSSProperties;
      contextMenuPosition: { x: number; y: number };
    }[]
  >(
    Array.from({ length: data.length }, () => ({
      isSelected: false,
      style: {},
      contextMenuPosition: { x: 0, y: 0 },
    }))
  );
  const [isOpendedContextMenu, setIsOpendedContextMenu] = useState(false);
  const mousePosition = useMousePosition();

  // 選択中のデータを取得
  const getSelectedData = () => {
    const selectedData: T[] = [];
    rowData.forEach((rowDatum, rowIndex) => {
      if (rowDatum.isSelected) {
        selectedData.push(data[rowIndex]);
      }
    });
    return selectedData;
  };

  useEffect(() => {
    const selectedData = getSelectedData();
    if (selectedData.length === 1 && onSelected) {
      onSelected(selectedData[0]);
    }
    if (onMultipleSelected) {
      onMultipleSelected(selectedData);
    }
  }, [rowData]);

  useEffect(() => {
    setRowData(
      Array.from({ length: data.length }, () => ({
        isSelected: false,
        style: {},
        contextMenuPosition: { x: 0, y: 0 },
      }))
    );
  }, [data]);

  const rowStyle: CSSProperties = {};

  if (rowHeight) {
    rowStyle.height = rowHeight;
  }

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr style={rowStyle} className={styles.table__tr}>
            {Object.keys(headers)
              .filter(
                (key) =>
                  !(
                    hiddenHeaders &&
                    hiddenHeaders?.includes(key as Extract<keyof T, string>)
                  )
              )
              .map((key) => (
                <th key={headers[key]}>
                  <Text
                    fontWeight={500}
                    size="medium"
                    color={uiConfig.color.text.main}
                  >
                    {headers[key]}
                  </Text>
                </th>
              ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              style={
                rowData[rowIndex]
                  ? { ...rowStyle, ...rowData[rowIndex].style }
                  : { ...rowStyle }
              }
              className={styles.table__tr}
              onClick={(event) => {
                const ctrlPressed = event.ctrlKey || event.metaKey;
                
                setRowData((rowData) => {
                  // 複数選択モードでない場合、またはCtrlキーが押されていない場合は従来の挙動
                  if (!multipleSelectable || (!ctrlPressed && !event.shiftKey)) {
                    const newArray = [
                      ...rowData.map((rowDatum) => {
                        rowDatum.isSelected = false;
                        rowDatum.style = {};
                        return rowDatum;
                      }),
                    ];

                    const currentRow = { ...newArray[rowIndex] };
                    currentRow.isSelected = !currentRow.isSelected;

                    if (
                      selectedRowBackgroundColor &&
                      currentRow.isSelected &&
                      !isOpendedContextMenu
                    ) {
                      currentRow.style = { ...currentRow.style };
                      currentRow.style.backgroundColor =
                        selectedRowBackgroundColor;
                    }

                    newArray[rowIndex] = currentRow;
                    return newArray;
                  } else {
                    // 複数選択モード時の処理
                    const newArray = [...rowData];
                    
                    // Ctrlキーが押されている場合は個別選択/選択解除
                    if (ctrlPressed) {
                      const currentRow = { ...newArray[rowIndex] };
                      currentRow.isSelected = !currentRow.isSelected;
                      
                      if (
                        selectedRowBackgroundColor &&
                        currentRow.isSelected &&
                        !isOpendedContextMenu
                      ) {
                        currentRow.style = { ...currentRow.style };
                        currentRow.style.backgroundColor =
                          selectedRowBackgroundColor;
                      } else {
                        currentRow.style = {};
                      }
                      
                      newArray[rowIndex] = currentRow;
                    }
                    // Shiftキーが押されている場合は範囲選択
                    else if (event.shiftKey) {
                      // 最後に選択された行を見つける
                      let lastSelectedIndex = -1;
                      for (let i = 0; i < newArray.length; i++) {
                        if (newArray[i].isSelected) {
                          lastSelectedIndex = i;
                        }
                      }
                      
                      if (lastSelectedIndex !== -1) {
                        // 範囲の開始と終了を決定
                        const start = Math.min(lastSelectedIndex, rowIndex);
                        const end = Math.max(lastSelectedIndex, rowIndex);
                        
                        // 範囲内のすべての行を選択
                        for (let i = start; i <= end; i++) {
                          newArray[i].isSelected = true;
                          if (selectedRowBackgroundColor && !isOpendedContextMenu) {
                            newArray[i].style = {
                              ...newArray[i].style,
                              backgroundColor: selectedRowBackgroundColor
                            };
                          }
                        }
                      } else {
                        // 最後に選択された行がない場合は、現在の行を選択
                        newArray[rowIndex].isSelected = true;
                        if (selectedRowBackgroundColor && !isOpendedContextMenu) {
                          newArray[rowIndex].style = {
                            ...newArray[rowIndex].style,
                            backgroundColor: selectedRowBackgroundColor
                          };
                        }
                      }
                    }
                    
                    return newArray;
                  }
                });

                // 単一選択の場合はhrefで移動
                if (!multipleSelectable || (!ctrlPressed && !event.shiftKey)) {
                  if (href) {
                    router.push(href(row));
                  }
                }
              }}
              onDoubleClick={() => {
                if (onDoubleClick) {
                  onDoubleClick(row);
                }
              }}
              onContextMenu={() => {
                setIsOpendedContextMenu((value) => !value);
                setRowData((rowData) => {
                  // 既に選択されている場合はコンテキストメニューを表示するだけ
                  if (rowData[rowIndex].isSelected) {
                    return rowData;
                  }
                  
                  // 選択されていない場合は、選択してからコンテキストメニューを表示
                  const newArray = multipleSelectable ?
                    [...rowData] :
                    [
                      ...rowData.map((rowDatum) => {
                        rowDatum.isSelected = false;
                        rowDatum.style = {};
                        return rowDatum;
                      }),
                    ];

                  const currentRow = { ...newArray[rowIndex] };
                  currentRow.isSelected = true;

                  if (
                    selectedRowBackgroundColor &&
                    currentRow.isSelected &&
                    !isOpendedContextMenu
                  ) {
                    currentRow.style = { ...currentRow.style };
                    currentRow.style.backgroundColor =
                      selectedRowBackgroundColor;
                  }

                  newArray[rowIndex] = currentRow;
                  return newArray;
                });
              }}
              key={rowIndex}
            >
              {Object.keys(headers)
                .filter(
                  (key) =>
                    !(
                      hiddenHeaders &&
                      hiddenHeaders?.includes(key as Extract<keyof T, string>)
                    )
                )
                .map((key, index) => {
                  return (
                    <td
                      className={styles.table__td}
                      key={`${rowIndex}.${index}`}
                    >
                      {showColumn ? showColumn(row, key) : row[key]}
                    </td>
                  );
                })}
            </tr>
          ))}
        </tbody>
      </table>

      {isOpendedContextMenu && getSelectedData().length > 0 && (
        <Select
          onClose={() => setIsOpendedContextMenu(false)}
          x={mousePosition.x}
          y={mousePosition.y}
        >
          {selectedChildren}
        </Select>
      )}
    </>
  );
};
