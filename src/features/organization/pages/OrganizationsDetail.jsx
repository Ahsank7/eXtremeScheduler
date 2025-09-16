import { Tabs, createStyles } from "@mantine/core";
import { AppContainer } from "shared/components";
import BasicSetting from "../components/BasicSetting";

import Lookup from "../components/Lookup";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { organizationService } from "core/services";
import { notifications } from "@mantine/notifications";
import Services from '../components/Services';
import RolePermissionManagement from '../components/RolePermissionManagement';
import { LoginHistory } from "features/loginHistory";

const useStyles = createStyles((theme) => ({
    tab: {
        padding: "1rem 1rem"
    },
    panel: {
        height: "100%",
        paddingTop: "1.25rem",
        overflow: "auto"
    },
    label: {
        color: "green",
        "&:focus": {
            borderColor: "#ced4da !important"
        }
    }
}));

const OrganizationDetail = () => {
    const [org, setOrg] = useState();

    const { classes } = useStyles();
    const { organizationID } = useParams();

    const tabs = [
        'Basic Settings',

        'Lookups',
        //'Document',
        'Services',
        'Access Control',
        'Login History',
    ];

    useEffect(() => {
        organizationService.getOrganizationById(organizationID)
            .then((response) => {
                if (response.isSuccess) {
                    setOrg(response.data);
                } else {
                    notifications.show({
                        title: "Error",
                        message: "Failed to fetch organization details",
                        color: "red",
                    });
                }
            })
            .catch((error) => {
                console.error("Failed to fetch organization details:", error);
                notifications.show({
                    title: "Error",
                    message: "Failed to fetch organization details",
                    color: "red",
                });
            });
    }, []);

    return (
        <AppContainer title={`${org?.name} Settings`}>
            <Tabs
                defaultValue="Basic Settings"
                variant="outline"
            >
                <Tabs.List>
                    {tabs.map((tab) => (
                        <Tabs.Tab className={classes.tab} value={tab} key={tab}>
                            {tab}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>

                <Tabs.Panel value="Basic Settings" className={classes.panel}>
                    <BasicSetting organization={org}></BasicSetting>
                </Tabs.Panel>



                <Tabs.Panel value="Lookups" className={classes.panel}>
                    <Lookup organizationid={organizationID}></Lookup>
                </Tabs.Panel>

               {/*<Tabs.Panel value="Document" className={classes.panel}>
                </Tabs.Panel>*/}


                <Tabs.Panel value="Services" className={classes.panel}>
                    <Services organizationId={organizationID} />
                </Tabs.Panel>

                <Tabs.Panel value="Access Control" className={classes.panel}>
                    <RolePermissionManagement organizationId={organizationID} />
                </Tabs.Panel>

                <Tabs.Panel value="Login History" className={classes.panel}>
                    <LoginHistory />
                </Tabs.Panel>

            </Tabs>
        </AppContainer>
    )
}

export default OrganizationDetail;