import { useState } from "react";
import { Table, ScrollArea, Button, createStyles } from "@mantine/core";

import { AppTableHeader, AppTablePagination, AppTableBody } from "shared/components";

const useStyles = createStyles(() => ({
  filterBtn: {
    position: "absolute",
    right: 0,
    top: ".5rem",
    zIndex: 1,
    borderBottomLeftRadius: "3rem",
    borderTopLeftRadius: "3rem",
  },
}));

export const AppTable = ({
  thead,
  currentPage = 1,
  pageSize,
  totalRecords,
  onPagination,
  onFilterBtn,
  children: tableBody,
  height = "68vh",
  horizontalSpacing = 'xl'
}) => {
  const [scrolled, setScrolled] = useState(false);
  const { classes } = useStyles();

  return (
    <>
      <div>
        <ScrollArea
          sx={{ height: height }}
          onScrollPositionChange={({ y }) => setScrolled(y)}
        >
          {onFilterBtn && (
            <Button
              size="md"
              className={classes.filterBtn}
              onClick={onFilterBtn}
            >
              Filter
            </Button>
          )}
          <Table
            verticalSpacing="sm"
            horizontalSpacing={horizontalSpacing}
            striped
            highlightOnHover
          >
            <AppTableHeader thead={thead} scrolled={scrolled} />
            <AppTableBody>
              {tableBody}
            </AppTableBody>
          </Table>
        </ScrollArea>

        {onPagination &&
          <AppTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPagination={onPagination}
          />
        }
      </div>
    </>
  );
};
