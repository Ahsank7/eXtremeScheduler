import { Box, Card, createStyles, Pagination } from "@mantine/core";

const useStyles = createStyles(() => ({
  pagination: {
    display: "flex",
    justifyContent: "flex-end",
  },
}));

export const AppTablePagination = ({
  currentPage,
  pageSize,
  totalRecords,
  onPagination,
}) => {
  const { classes } = useStyles();

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <Card>
      <Box className={classes.pagination}>
        <Pagination
          page={currentPage}
          total={totalPages}
          onChange={onPagination}
          radius="xl"
          size="xl"
          withEdges
          siblings={0}
        />
      </Box>
    </Card>
  );
};
