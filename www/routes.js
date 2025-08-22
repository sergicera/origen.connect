/**
 * This file is used to define the routes for the application.
 */
import LoaderIfcView from "@/www/views/IfcLoader/IfcRawLoader";
import PlansSapView from "@/www/views/IfcLoader/SapRawViewer";
import PropertiesIfcView from "@/www/views/IfcLoader/IfcPropertiesManager";
import SynoptiquesView from "@/www/views/IfcLoader/AisSynoptiquesManager";

// Connect
const conn = [
  {
    path: "/loader/ifc/file",
    component: LoaderIfcView,
    props: {},
  },
  {
    path: "/loader/ifc/properties",
    component: PropertiesIfcView,
    props: {},
  },
  {
    path: "/loader/sap/plans",
    component: PlansSapView,
    props: {},
  },
  {
    path: "/descriptif/synoptiques",
    component: SynoptiquesView,
    props: {},
  },
];

export const routes = [...conn];
