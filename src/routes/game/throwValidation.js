import { FinishingRule, EnterRules } from "../../lib/stores/gameSettings";


/**
 *  Checks wether or not a throw was valid to finish for a given finishing rule
 */
export function validateEnter(throwValue, throwMultiplier, enterRule){
    switch (enterRule){
        case EnterRules.STRAIGHT_IN:
            //The player is allowed to finish in anyway
            return true

        case EnterRules.BULL_IN:
            //Can only finish with a Bulls Ring or Bulls Eye
            if(throwValue == 25){
                return true
            } else {
                return false
            }

        case EnterRules.BULLS_EYE_IN:
            //Can only finish with Bulls Eye (Double & 25)
            if(throwValue == 25 && throwMultiplier == 2){
                return true
            } else {
                return false
            }

        case EnterRules.MASTER_IN:
            if(throwMultiplier >= 2){
                return true
            } else {
                return false
            }

        case EnterRules.DOUBLE_IN:
            if(throwMultiplier == 2){
                return true
            } else {
                return false
            }

        case EnterRules.TRIPPLE_IN:
            if(throwMultiplier == 3){
                return true
            } else {
                return false
            }

        case EnterRules.QUADRUPLE_IN:
            if(throwMultiplier == 4){
                return true
            } else {
                return false
            }

        default:
            console.log('No matching Finishing Rule found!')
            return false
    }
}

/**
 * This is basically the same as the entering rules but this can later be modified to have more different things
 * Checks wether or not a throw was valid to finish for a given finishing rule
 */
export function validateFinishRule(throwValue, throwMultiplier, finishingRule){
    switch (finishingRule){
        case FinishingRule.STRAIGHT_OUT:
            //The player is allowed to finish in anyway
            return true

        case FinishingRule.BULL_OUT:
            //Can only finish with a Bulls Ring or Bulls Eye
            if(throwValue == 25){
                return true
            } else {
                return false
            }

        case FinishingRule.BULLS_EYE_OUT:
            //Can only finish with Bulls Eye (Double & 25)
            if(throwValue == 25 && throwMultiplier == 2){
                return true
            } else {
                return false
            }

        case FinishingRule.MASTER_OUT:
            if(throwMultiplier >= 2){
                return true
            } else {
                return false
            }

        case FinishingRule.DOUBLE_OUT:
            if(throwMultiplier == 2){
                return true
            } else {
                return false
            }

        case FinishingRule.TRIPPLE_OUT:
            if(throwMultiplier == 3){
                return true
            } else {
                return false
            }

        case FinishingRule.QUADRUPLE_OUT:
            if(throwMultiplier == 4){
                return true
            } else {
                return false
            }

        default:
            console.log('No matching Finishing Rule found!')
            return false
    }
}

export function validateFinishLimit(throwValue, throwMultiplier, currentScore, finishingRule){
    const newScore = currentScore-(throwValue*throwMultiplier)
    switch (finishingRule){
        case FinishingRule.STRAIGHT_OUT:
            //The player is allowed to finish in anyway
            if(newScore >= 1){
                return true
            } else {
                return false
            }

        case FinishingRule.BULL_OUT:
            //Can only finish with a Bulls Ring or Bulls Eye
            if(newScore >= 25){
                return true
            } else {
                return false
            }

        case FinishingRule.BULLS_EYE_OUT:
            //Can only finish with Bulls Eye (Double & 25)
            if(newScore >= 50){
                return true
            } else {
                return false
            }

        case FinishingRule.MASTER_OUT:
            if(newScore >= 2){
                return true
            } else {
                return false
            }

        case FinishingRule.DOUBLE_OUT:
            if(newScore >= 2){
                return true
            } else {
                return false
            }

        case FinishingRule.TRIPPLE_OUT:
            if(newScore >= 3){
                return true
            } else {
                return false
            }

        case FinishingRule.QUADRUPLE_OUT:
            if(newScore >= 4){
                return true
            } else {
                return false
            }

        default:
            console.log('No matching Finishing Rule found!')
            return false
    }
}