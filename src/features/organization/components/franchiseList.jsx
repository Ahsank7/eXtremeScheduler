import { Grid } from "@mantine/core";
import FranchiseCard from "./franchiseCard";

const FranchiseList = ({ franchises, onFranchise }) => {
  return (
    <Grid gutter="3rem" pr="md" pl="md">
      {franchises.map((franchise) => (
        <Grid.Col key={franchise.id} xs="12" md="6" lg="4">
          <FranchiseCard franchise={franchise} onFranchise={onFranchise} />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default FranchiseList;
