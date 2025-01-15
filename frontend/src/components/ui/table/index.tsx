import styles from "./index.module.scss";
import { CSSProperties, useEffect, useState } from "react";
import { Text } from "../text";
import { uiConfig } from "../uiConfig";
import { Select } from "../select";
import { useMousePosition } from "@/hooks/useMousePosition";

type RowData = Record<string, React.ReactNode>;

type Props<T extends RowData> = {
  isFixedHead: boolean;
  headers: Array<Extract<keyof T, string>>;
  data: T[];
  rowHeight?: string;
  onSelected?: (index: number) => void;
  selectedRowBackgroundColor?: string;
  selectedChildren: React.ReactNode;
};

export const SelectableTable = <T extends RowData>({
  headers,
  data,
  rowHeight = "48px",
  onSelected,
  selectedRowBackgroundColor,
  selectedChildren,
}: Props<T>) => {
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

  const rowStyle: CSSProperties = {};

  if (rowHeight) {
    rowStyle.height = rowHeight;
  }

  useEffect(() => {
    const clickHandler = () => {
      setIsOpendedContextMenu(false);
    };

    document.body.addEventListener("click", clickHandler);

    return () => document.body.removeEventListener("click", clickHandler);
  }, []);

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr style={rowStyle} className={styles.table__tr}>
            {headers.map((header) => (
              <th key={header}>
                <Text
                  fontWeight={500}
                  size="medium"
                  color={uiConfig.color.text.main}
                >
                  {header}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              style={{ ...rowStyle, ...rowData[rowIndex].style }}
              className={styles.table__tr}
              onClick={() => {
                setRowData((rowData) => {
                  return rowData.map((rowDatum) => {
                    rowDatum.isSelected = false;
                    rowDatum.style = {};

                    return rowDatum;
                  });
                });
                setRowData((rowData) => {
                  const newArray = [...rowData];
                  const currentRow = { ...newArray[rowIndex] };
                  currentRow.isSelected = !currentRow.isSelected;

                  if (selectedRowBackgroundColor) {
                    currentRow.style = { ...currentRow.style };
                    if (currentRow.isSelected) {
                      currentRow.style.backgroundColor =
                        selectedRowBackgroundColor;
                    } else {
                      currentRow.style.backgroundColor = "";
                    }
                  }

                  if (currentRow.isSelected && onSelected) {
                    onSelected(rowIndex);
                  }

                  newArray[rowIndex] = currentRow;
                  return newArray;
                });
              }}
              onContextMenu={() => {
                setIsOpendedContextMenu((value) => !value);
                setRowData((rowData) => {
                  return rowData.map((rowDatum) => {
                    rowDatum.isSelected = false;
                    rowDatum.style = {};

                    return rowDatum;
                  });
                });
                setRowData((rowData) => {
                  const newArray = [...rowData];
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

                  if (currentRow.isSelected && onSelected) {
                    onSelected(rowIndex);
                  }

                  newArray[rowIndex] = currentRow;
                  return newArray;
                });
              }}
              key={rowIndex}
            >
              {headers.map((header, index) => (
                <td className={styles.table__td} key={`${rowIndex}.${index}`}>
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {isOpendedContextMenu && (
        <Select x={mousePosition.x} y={mousePosition.y}>
          {selectedChildren}
        </Select>
      )}
    </>
  );
};
