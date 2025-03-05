Filename 
=======================================================
- Use PascalCase for filenames. 

    E.g., ReservationCard.jsx

Reference Naming
=======================================================
- Use PascalCase for React components.
    
    E.g., import ReservationCard from './ReservationCard';

camelCase for their instances.
=======================================================
    const reservationItem = <ReservationCard />;


Component Naming: Use the filename as the component name. 
=======================================================
- For example, ReservationCard.jsx should have a reference name of ReservationCard. 

- However, for root components of a directory, use index.jsx as the filename and use the directory name as the component name:

    // DO NOT USE
        import Footer from './Footer/index';

    // USE THIS
        import Footer from './Footer';

*************
*** Props ***
*************
 
Props format in JSX
===================
- Always use camelCase for prop names, or PascalCase if the prop value is a React component.
    // bad
        <Foo
        UserName="hello"
        phone_number={12345678}
        />

    // good
        <Foo
        userName="hello"
        phoneNumber={12345678}
        Component={SomeComponent}
        />

Props Naming: Avoid using DOM component prop names for different purposes.
==========================================================================
// DO NOT USE
    <MyComponent style="fancy" />

// DO NOT USE
    <MyComponent className="fancy" />

// USE LIKE
    <MyComponent variant="fancy" />


***********
*** JSX ***
***********

Follow these alignment styles for JSX syntax. 
===========================================================================
// bad
    <Foo superLongParam="bar"
        anotherSuperLongParam="baz" />

// good
    <Foo
    superLongParam="bar"
    anotherSuperLongParam="baz"
    />

// if props fit in one line then keep it on the same line
    <Foo bar="bar" />

// With Condition

    {someConditional ? (
        <Foo />
    ) : (
        <Foo
            superLongParam="bar"
            anotherSuperLongParam="baz"
        />
    )}

Always use double quotes (") for JSX attributes
===========================================================================
// bad
    <Foo bar='bar' />

// good
    <Foo bar="bar" />

Single quotes (') for all other JSX. eslint: jsx-quotes (https://eslint.org/docs/latest/rules/jsx-quotes)
===========================================================================
// bad
    <Foo style={{ left: "20px" }} />

// good
    <Foo style={{ left: '20px' }} />

Do not pad JSX curly braces with spaces. eslint:
===========================================================================
// bad
    <Foo bar={ baz } />

// good
<Foo bar={baz} />

JSX Image Tag 
===========================================================================
- Always include an alt prop on <img> tags. If the image is presentational, alt can be an empty string or 
    the <img> must have role="presentation". eslint: jsx-a11y/alt-text

    // bad
    <img src="hello.jpg" />

    // good
    <img src="hello.jpg" alt="Me waving hello" />

    // good
    <img src="hello.jpg" alt="" />

    // good
    <img src="hello.jpg" role="presentation" />


JSX Parentheses
=============================================================================
- Wrap JSX tags in parentheses when they span more than one line.

    // bad
    render() {
        return  <MyComponent variant="long body" foo="bar">
                    <MyChild />
                </MyComponent>;
    }

    // good
    render() {
        return (
            <MyComponent variant="long body" foo="bar">
            <MyChild />
            </MyComponent>
        );
    }

    // good, when single line
    render() {
        const body = <div>hello</div>;
        return <MyComponent>{body}</MyComponent>;
    }