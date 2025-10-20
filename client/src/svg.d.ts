declare module "*.svg?react" {
    import * as React from "react";
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}
