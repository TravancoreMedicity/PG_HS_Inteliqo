import React, { Fragment } from 'react';
import { Checkbox, FormControlLabel } from '@material-ui/core';
const Checkboxcompnt = ({ approval, updateApproval, name, label }) => {
    return (
        <Fragment>
            <FormControlLabel
                control={
                    <Checkbox
                        name={name}
                        color="secondary"
                        value={approval}
                        checked={approval}
                        onChange={(e) => updateApproval(e)}
                    />
                }
                label={label}
            />
        </Fragment>
    )
};
export default Checkboxcompnt;
