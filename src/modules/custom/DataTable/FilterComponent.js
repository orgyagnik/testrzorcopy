import React from "react";
import styled from "styled-components";

const Input = styled.input.attrs(props => ({
  type: "text",
  size: props.small ? 5 : undefined
}))`

`;



const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <>
  <div className="input-group static-data-tbl-input-group ms-auto">
      <Input
        id="search"
        type="text"
        className="static-data-tbl-search form-control-sm form-control"
        placeholder="Search"
        value={filterText}
        onChange={onFilter}
      />
      <button onClick={onClear} className="static-data-tbl-clear btn btn-sm btn-outline-secondary"><i className="icon-cancel"></i></button>
    </div>
  </>
);

export default FilterComponent;
