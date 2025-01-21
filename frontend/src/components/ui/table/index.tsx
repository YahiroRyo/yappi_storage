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
  rowHeight?: string;
  onSelected?: (datum: T) => void;
  href?: (datum: T) => string;
  selectedRowBackgroundColor?: string;
  selectedChildren: React.ReactNode;
};

export const SelectableTable = <T extends RowData>({
  headers,
  hiddenHeaders,
  data,
  rowHeight = "48px",
  onSelected,
  href,
  selectedRowBackgroundColor,
  selectedChildren,
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

  useEffect(() => {
    rowData.forEach((rowDatum, rowIndex) => {
      if (rowDatum.isSelected && onSelected) {
        onSelected(data[rowIndex]);
      }
    });
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
              onClick={() => {
                setRowData((rowData) => {
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
                });

                if (href) {
                  router.push(href(row));
                }
              }}
              onContextMenu={() => {
                setIsOpendedContextMenu((value) => !value);
                setRowData((rowData) => {
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
                .map((key, index) => (
                  <td className={styles.table__td} key={`${rowIndex}.${index}`}>
                    {row[key]}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>

      {isOpendedContextMenu && (
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
