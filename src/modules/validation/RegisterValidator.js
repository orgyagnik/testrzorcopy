export const RegisterValidator = (plan, email, password, confirmPassword, firstName, lastName, companyName, address, country, state, city, zipCode, phone, termsCondition) => [
    {
        name: "plan",
        inputName: "planInput",
        value: plan,
        validation: ['required'],
        message: {
            required: 'Please select dev plan.'
        }
    },
    {
        name: "email",
        inputName: "emailInput",
        value: email,
        validation: ['required', 'email'],
    },
    {
        name: "password",
        inputName: "passwordInput",
        value: password,
        validation: ['password'],
    },
    {
        name: "confirm password",
        inputName: "confirmPasswordInput",
        value: confirmPassword,
        validation: ['password', `confirmed:${password}`],
    },
    {
        name: "first name",
        inputName: "firstNameInput",
        value: firstName,
        validation: ['required'],
    },
    {
        name: "last name",
        inputName: "lastNameInput",
        value: lastName,
        validation: ['required'],
    },
    {
        name: "company name",
        inputName: "companyNameInput",
        value: companyName,
        validation: ['required'],
    },
    {
        name: "address",
        inputName: "streetAddressInput",
        value: address,
        validation: ['required'],
    },
    {
        name: "country",
        inputName: "countryInput",
        value: country,
        validation: ['required'],
    },
    {
        name: "state",
        inputName: "stateInput",
        value: state,
        validation: ['required'],
    },
    {
        name: "city",
        inputName: "cityInput",
        value: city,
        validation: ['required'],
    },
    {
        name: "zipcode",
        inputName: "zipCodeInput",
        value: zipCode,
        validation: ['required'],
    },
    {
        name: "phone number",
        inputName: "phoneInput",
        value: phone,
        validation: ['required', 'phone'],
    },
    {
        name: "Terms Condition",
        inputName: "termsConditionInput",
        value: termsCondition,
        validation: ['required'],
    }
];

export const CouponVerifyValidator = (plan, coupon) => [
    {
        name: "plan",
        inputName: "planInput",
        value: plan,
        validation: ['required'],
        message: {
            required: 'Please select dev plan.'
        }
    },
    {
        name: "coupon",
        inputName: "couponInput",
        value: coupon,
        validation: ['required'],
    },
];

export const SiteAddonRegisterValidator = (plan, email, password, confirmPassword, firstName, lastName, companyName, address, country, state, city, zipCode, phone, termsCondition) => [
    {
        name: "plan",
        inputName: "planInput",
        value: plan,
        validation: ['required'],
        message: {
            required: 'Please select at least 1 plan for each website.'
        }
    },
    {
        name: "email",
        inputName: "emailInput",
        value: email,
        validation: ['required', 'email'],
    },
    {
        name: "password",
        inputName: "passwordInput",
        value: password,
        validation: ['password'],
    },
    {
        name: "confirm password",
        inputName: "confirmPasswordInput",
        value: confirmPassword,
        validation: ['password', `confirmed:${password}`],
    },
    {
        name: "first name",
        inputName: "firstNameInput",
        value: firstName,
        validation: ['required'],
    },
    {
        name: "last name",
        inputName: "lastNameInput",
        value: lastName,
        validation: ['required'],
    },
    {
        name: "company name",
        inputName: "companyNameInput",
        value: companyName,
        validation: ['required'],
    },
    {
        name: "address",
        inputName: "streetAddressInput",
        value: address,
        validation: ['required'],
    },
    {
        name: "country",
        inputName: "countryInput",
        value: country,
        validation: ['required'],
    },
    {
        name: "state",
        inputName: "stateInput",
        value: state,
        validation: ['required'],
    },
    {
        name: "city",
        inputName: "cityInput",
        value: city,
        validation: ['required'],
    },
    {
        name: "zipcode",
        inputName: "zipCodeInput",
        value: zipCode,
        validation: ['required'],
    },
    {
        name: "phone number",
        inputName: "phoneInput",
        value: phone,
        validation: ['required', 'phone'],
    },
    {
        name: "Terms Condition",
        inputName: "termsConditionInput",
        value: termsCondition,
        validation: ['required'],
    }
];

export const BucketRegisterValidator = (plan, email, password, confirmPassword, firstName, lastName, companyName, address, country, state, city, zipCode, phone, termsCondition) => [
    {
        name: "plan",
        inputName: "planInput",
        value: plan,
        validation: ['required'],
        message: {
            required: 'Please select bucket plan.'
        }
    },
    {
        name: "email",
        inputName: "emailInput",
        value: email,
        validation: ['required', 'email'],
    },
    {
        name: "password",
        inputName: "passwordInput",
        value: password,
        validation: ['password'],
    },
    {
        name: "confirm password",
        inputName: "confirmPasswordInput",
        value: confirmPassword,
        validation: ['password', `confirmed:${password}`],
    },
    {
        name: "first name",
        inputName: "firstNameInput",
        value: firstName,
        validation: ['required'],
    },
    {
        name: "last name",
        inputName: "lastNameInput",
        value: lastName,
        validation: ['required'],
    },
    {
        name: "company name",
        inputName: "companyNameInput",
        value: companyName,
        validation: ['required'],
    },
    {
        name: "address",
        inputName: "streetAddressInput",
        value: address,
        validation: ['required'],
    },
    {
        name: "country",
        inputName: "countryInput",
        value: country,
        validation: ['required'],
    },
    {
        name: "state",
        inputName: "stateInput",
        value: state,
        validation: ['required'],
    },
    {
        name: "city",
        inputName: "cityInput",
        value: city,
        validation: ['required'],
    },
    {
        name: "zipcode",
        inputName: "zipCodeInput",
        value: zipCode,
        validation: ['required'],
    },
    {
        name: "phone number",
        inputName: "phoneInput",
        value: phone,
        validation: ['required', 'phone'],
    },
    {
        name: "Terms Condition",
        inputName: "termsConditionInput",
        value: termsCondition,
        validation: ['required'],
    }
];

export const BucketCouponVerifyValidator = (plan, coupon) => [
    {
        name: "plan",
        inputName: "planInput",
        value: plan,
        validation: ['required'],
        message: {
            required: 'Please select bucket plan.'
        }
    },
    {
        name: "coupon",
        inputName: "couponInput",
        value: coupon,
        validation: ['required'],
    },
];