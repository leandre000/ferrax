import TestDrive from "../models/test.drive.model.js"
import Car from "../models/car.model.js"

export const getScheduledTestDrives = async (req, res) => {
    try {
        const tests = await TestDrive.find()
        return res.status(200).json({ tests : tests, success : true })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const getMyTestDrives = async (req, res) => {
    const { _id } = req.user
    try {
        const tests = await TestDrive.find({ user : _id })
        return res.status(200).json({ tests : tests, success : true })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const scheduleTestDrive = async (req, res) => {
    const { _id } = req.user;
    const { carId, preferredDate, preferredTime, notes } = req.body;
    try {
        const car = await Car.findById(carId)
        if (!car) return res.status(404).json({ message: 'Car not found' })
        if (car.status !== 'available') return res.status(400).json({ message: 'Car not available' });
        const testDrive = new TestDrive({
            car : carId,
            user : _id,
            preferredDate,
            preferredTime,
            notes
        })
        await testDrive.save()
        return res.status(200).json({ message : 'Test drive scheduled successfully', success : true })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const cancelTestDrive = async (req, res) => {
    const { _id } = req.user;
    const { testDriveId } = req.params;
    try {
        const testDrive = await TestDrive.findById(testDriveId)
        if (!testDrive) return res.status(404).json({ message: 'Test drive not found' })
        if (testDrive.user.toString() !== _id.toString()) return res.status(403).json({ message: 'Forbidden' })
        testDrive.status = 'cancelled'
        await testDrive.save()
        return res.status(200).json({ message : 'Test drive cancelled successfully', success : true })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const confirmTestDrive = async (req, res) => {
    const { _id } = req.user;
    const { testDriveId } = req.params;
    try {
        const testDrive = await TestDrive.findById(testDriveId)
        if (!testDrive) return res.status(404).json({ message: 'Test drive not found' })
        if (testDrive.user.toString() !== _id.toString()) return res.status(403).json({ message: 'Forbidden' })
        testDrive.status = 'confirmed'
        await testDrive.save()
        return res.status(200).json({ message : 'Test drive confirmed successfully', success : true })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const deleteTestDrive = async (req, res) => {
    const { _id } = req.user;
    const { testDriveId } = req.params;
    try {
        const testDrive = await TestDrive.findById(testDriveId)
        if (!testDrive) return res.status(404).json({ message: 'Test drive not found' })
        if (testDrive.user.toString() !== _id.toString()) return res.status(403).json({ message: 'Forbidden' })
        await testDrive.deleteOne()
        return res.status(200).json({ message : 'Test drive deleted successfully', success : true })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
};



